'use strict';

const util = require('util');

const metaObjectmodel = {
    "type": {type: "string", optional: false},
    "optional": {type: "boolean", optional: false}
};
const metaStringModel = {
    "*": "s"
};

let cache = {};

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function truetype(o) {
    const result = typeof o;
    if (o === null) return 'null';
    if (Array.isArray(o)) return 'array';
    return result;
}

function encodeValue(model) {
    let result = '';
    if (model.type === 'string') result = '$';
    if (model.type === 'boolean') result = 'b';
    if (model.type === 'number') result = '#';
    if (model.type === 'integer') result = '0';
    if (model.type === 'null') result = '!';
    if (model.type === 'object') result = '{}';
    if (model.type === 'array') result = '[]';
    if (model.optional) result += '?';
    return result;
}

function decodeValue(str,property) {
    if (typeof str !== 'string') return str;
    if (cache[str]) {
        return cache[str];
    }
    let model = {};
    const typeChar = str.length ? str[0] : '!';
    if (typeChar === '$') model.type = 'string';
    if (typeChar === 'b') model.type = 'boolean';
    if (typeChar === '#') model.type = 'number';
    if (typeChar === '0') model.type = 'integer';
    if (typeChar === '!') model.type = 'null';
    if (typeChar === '{') model.type = 'object';
    if (typeChar === '[') model.type = 'array';
    model.optional = str.indexOf('?')>=0;
    model.nullable = str.indexOf('-')>=0;
    model.name = property;
    cache[str] = model;
    return model;
}

function decodeModel(model) {
    let m = clone(model);
    if (Array.isArray(m)) {
        m = [{"":decodeValue("[]"), "[]":decodeValue(m[0])}];
    }
    else if (typeof m === 'string') {
        m = {'':decodeValue(m)};
    }
    else for (let property of Object.keys(m)) {
        m[property] = decodeValue(m[property],property);
    }
    return m;
}

function jsonSchema(model) {
    let s = clone(model);
    let required = [];
    for (let property of Object.keys(s)) {
        if (!s[property].optional) required.push(property);
        delete s[property].optional;
        if (s[property].nullable) s[property].type = [s.property[type],null];
        delete s[property].nullable;
    }
    if (required.length) s.required = required;
    return s;
}

function fail(result,obj,model,message) {
    result.ok = false;
    result.obj = obj;
    result.model = model;
    result.message = message||'Bug - no message';
    return result;
}

function internal(obj,model,step) {
    let result = {ok:true,modelStr:model,model:model,obj:obj,step:step,message:'None'};
    model = result.model = decodeModel(model);
    if (Array.isArray(model)) model = model[0]; //
    for (let property of Object.keys(model)) {
        let value = model[property];
        let p = (property === '*' ? Object.values(obj) : obj[property]);
        if (property === '') p = obj
        if ((property !== '[]') && (property !== '*')) p = [p];
        for (let pi in p) {
            let pp = p[pi];
            let ep = property;
            if (property == '[]') ep = pi;
            if (!value.optional && (typeof pp === 'undefined')) {
                fail(result,obj,model,'Missing property `'+ep+'`');
            }
            if (!value.optional || (typeof pp !== 'undefined')) {
                if ((truetype(pp) === 'number') && (value.type === 'integer') && (Math.trunc(pp) == pp)) {
                    // this is ok
                }
                else if (truetype(pp) !== value.type) {
                    fail(result,obj,model,'Property `'+ep+'` should be type `'+value.type+'` but it is type `'+truetype(pp)+'`');
                }
            }
        }

        if (!result.ok) return result;
    }
    return result;
}

function validate(obj,model) {
    //let result = internal(model,metaStringModel,'model');
    //if (result.ok) result = internal(obj,model,'object');
    let result = internal(obj,model,'object');
    return result;
}

module.exports = {
    validate: validate
};

