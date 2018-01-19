'use strict';

const util = require('util');

const metaStringModel = {
    "*": "$"
};
const metaObjectModel = {
    "type": "$",
    "name": "$-",
    "optional": "b",
    "nullable": "b"
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

function chomp(str,index,charset) {
    let length = 0;
    while ((charset.indexOf(str.substr(index+length,1))>=0) && ((index+length)<=str.length)) length++;
    return str.substr(index,length);
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
    if (model.type === 'variable') result = '*';
    if (model.type === 'undefined') result = '~';
    if (model.optional) result += '?';
    return result;
}

function decodeValue(str,property) {
    if (typeof str !== 'string') return str;
    if (cache[str]) {
        return cache[str];
    }
    let model = {};
    model.name = property;
    const typeChar = str.length ? str[0] : '~';
    if (typeChar === '$') model.type = 'string';
    if (typeChar === 'b') model.type = 'boolean';
    if (typeChar === '#') model.type = 'number';
    if (typeChar === '0') model.type = 'integer';
    if (typeChar === '!') model.type = 'null';
    if (typeChar === '{') model.type = 'object';
    if (typeChar === '[') model.type = 'array';
    if (typeChar === '~') model.type = 'undefined';
    if (typeChar === '*') model.type = 'variable';
    model.optional = str.indexOf('?')>=0;
    model.nullable = str.indexOf('-')>=0;
    // patterns, refs, oneOf, allOf, anyOf etc
    let minPos = str.indexOf('>');
    if (minPos>=0) {
        let min = chomp(str,minPos+1,'0123456789'+(model.type === 'number' ? '.' : ''));
        if (min) {
            str = str.replace('>'+min,'');
            model.min = (model.type === 'number') ? new Number(min) : Math.trunc(min);
        }
    }
    let maxPos = str.indexOf('<');
    if (maxPos>=0) {
        let max = chomp(str,maxPos+1,'0123456789'+(model.type === 'number' ? '.' : ''));
        if (max) {
            str = str.replace('<'+max,'');
            model.max = (model.type === 'number') ? new Number(max) : Math.trunc(max);
        }
    }
    let enumPos = str.indexOf('=[');
    if (enumPos>=0) {
        let enums = str.substr(enumPos+1).split(']=')[0];
        str = str.replace('=['+enums+']=','');
        model.enum = JSON.parse(enums+']');
    }
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

function jsonSchema(model,openapi) {
    let s = clone(model);
    let required = [];
    for (let property of Object.keys(s)) {
        if (!s[property].optional) required.push(property);
        delete s[property].optional;
        if (!openapi) {
            if (s[property].nullable) {
                s[property].type = [s.property[type],null];
            }
            delete s[property].nullable;
        }
    }
    if (required.length) s.required = required;
    return s;
}

function mson(model) {
    // TODO
    return '';
}

function fail(result,obj,model,message) {
    result.ok = false;
    result.obj = obj;
    result.model = model;
    result.message = message||'Bug - no message';
    return result;
}

function internal(obj,model,step,options) {
    let result = {ok:true,modelStr:model,model:model,obj:obj,step:step,message:'None'};
    model = result.model = decodeModel(model);
    if (Array.isArray(model)) model = model[0];
    for (let property of Object.keys(model)) {
        let value = model[property];
        let p = (property === '*' ? Object.values(obj) : (obj === null ? null : obj[property]));
        if ((property === '') || (property === '[]')) p = obj // the object itself
        if ((property !== '[]') && (property !== '*')) p = [p]; // wrap in array

        if (property.startsWith('\\')) property = property.replace('\\','');

        for (let pi in p) {
            let pp = p[pi];
            let ep = property;
            if (property === '[]') ep = pi;

            if (!value.optional && (typeof pp === 'undefined')) {
                fail(result,obj,model,'Missing property `'+ep+'`');
            }

            if (result.ok && (!value.optional || (typeof pp !== 'undefined'))) {
                if ((truetype(pp) === 'number') && (value.type === 'integer') && (Math.trunc(pp) == pp)) {
                    // this is ok
                }
                else if (value.nullable && (truetype(pp) === 'null')) {
                    // this also is ok
                }
                else if (value.type === 'variable') {
                    // this is definitely ok
                }
                else if (truetype(pp) !== value.type) {
                    fail(result,obj,model,'Property `'+ep+'` should be type `'+value.type+'` but it is type `'+truetype(pp)+'`');
                }
            }

            if (result.ok && ((value.type === 'string') || (value.type === 'array'))) {
                if (typeof value.min !== 'undefined') {
                    if (pp.length<=value.min) {
                        fail(result,obj,model,'Property `'+ep+'` must have minimum length '+value.min);
                    }
                }
                if (typeof value.max !== 'undefined') {
                    if (pp.length>=value.max) {
                        fail(result,obj,model,'Property `'+ep+'` must have maximum length '+value.max);
                    }
                }
            }

            // TODO min and max are not yet tested against 'variable's as they could have multiple meanings
            if (result.ok && (value.type === 'integer' || (value.type === 'number'))) {
                if (typeof value.min !== 'undefined') {
                    if (pp<=value.min) {
                        fail(result,obj,model,'Property `'+ep+'` must be minimum '+value.min);
                    }
                }
                if (typeof value.max !== 'undefined') {
                    if (pp>=value.max) {
                        fail(result,obj,model,'Property `'+ep+'` must be maximum '+value.max);
                    }
                }
            }

            if (result.ok && value.enum && value.enum.length) {
                let found = false;
                for (let e of value.enum) {
                    if (pp === e) found = true;
                }
                if (!found) fail(result,obj,model,'Property `'+ep+'` does not match any enum value');
            }

        }

        if (!result.ok) return result;
    }
    return result;
}

function validate(obj,model,options) {
    if (!options) options = {validateModel:false};
    if (options.validateModel) {
        let result = internal(model,metaStringModel,'model',options);
        //if (result.ok) {
        //    let em = decodeModel(model);
        //    result = internal(em,metaObjectModel,'decoded',options);
        //}
        if (result.ok) result = internal(obj,model,'object',options);
        return result;
    }
    else return internal(obj,model,'object',options);
}

module.exports = {
    validate: validate
};

