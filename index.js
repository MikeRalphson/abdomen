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
    if (model.type === 'string') result = 'a';
    if (model.type === 'boolean') result = 'b';
    if (model.type === 'number') result = '#';
    if (model.type === 'null') result = '!';
    if (model.type === 'object') result = '{}';
    if (model.type === 'array') result = '[]';
    if (model.optional) result += '?';
    return result;
}

function decodeValue(str,property) {
    if (typeof str !== 'string') return str;
    if (cache[str]) {
        console.log('CACHED',str);
        return cache[str];
    }
    let model = {};
    const typeChar = str.length ? str[0] : '!';
    if (typeChar === 'a') model.type = 'string';
    if (typeChar === 'b') model.type = 'boolean';
    if (typeChar === '#') model.type = 'number';
    if (typeChar === '!') model.type = 'null';
    if (typeChar === '{') model.type = 'object';
    if (typeChar === '[') model.type = 'array';
    model.optional = str.indexOf('?')>=0;
    model.name = property;
    console.log('input:',property,':',str);
    console.log('output:',util.inspect(model,{depth:null}));
    console.log('compare:',encodeValue(model));
    cache[str] = model;
    return model;
}

function decodeModel(model) {
    let m = clone(model);
    for (let property of Object.keys(m)) {
        m[property] = decodeValue(m[property],property);
    }
    console.log(util.inspect(m,{depth:null}));
    return m;
}

function jsonSchema(model) {
    let s = clone(model);
    let required = [];
    for (let property of Object.keys(s)) {
        if (!s[property].optional) required.push(property);
        delete s[property].optional;
    }
    if (required.length) s.required = required;
    return s;
}

function fail(result,obj,model,message) {
    result.ok = false;
    result.obj = obj;
    result.model = model;
    result.message = message;
    //console.log(util.inspect(result,{depth:null}));
    return result;
}

function internal(obj,model,step) {
    let result = {ok:true,modelStr:model,model:model,obj:obj,step:step};
    model = result.model = decodeModel(model);
    for (let property of Object.keys(model)) {
        let value = model[property];
        if (!value.optional && (typeof obj[property] === 'undefined')) fail(result,obj,model,'Missing property `'+property+'`');
        if (!value.optional || (typeof obj[property] !== 'undefined')) {
            if (truetype(obj[property]) !== value.type) fail(result,obj,model,'Property `'+property+'` should be type `'+value.type+'` but it is type `'+truetype(obj[property])+'`');
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

