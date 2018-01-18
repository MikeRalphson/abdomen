'use strict';

const util = require('util');

const metamodel = {
};

function truetype(o) {
    const result = typeof o;
    if (o === null) return 'null';
    if (Array.isArray(o)) return 'array';
    return result;
}

function decode(str) {
    let model = {};
    const typeChar = str.length ? str[0] : '!';
    if (typeChar === 'a') model.type = 'string';
    if (typeChar === '#') model.type = 'number';
    if (typeChar === '!') model.type = 'null';
    if (typeChar === '{') model.type = 'object';
    if (typeChar === '[') model.type = 'array';
    model.optional = str.indexOf('?')>=0;
    console.log('input:',str);
    console.log('output:',util.inspect(model,{depth:null}));
    return model;
}

function fail(result,message) {
    result.ok = false;
    result.message = message;
    return result;
}

function validate(obj,model) {
    let result = (model === metamodel ? {ok:true} : validate(model,metamodel));
    if (result) {
        console.log('Passed metamodel');
    }
    for (let property of Object.keys(model)) {
        let value = model[property];
        if (typeof value === 'string') {
            value = decode(value);
        }
        if (truetype(value) === 'object') {
            if (!value.optional && (typeof obj[property] === 'undefined')) fail(result,'Missing property '+property);
            if (!value.optional || typeof obj[property] !== 'undefined') {
                console.log(property,truetype(obj[property]),value.type,typeof value.type);
                if (truetype(obj[property]) !== value.type) fail(result,'Property '+property+' should be a '+value.type);
            }
        }
        else fail(result,'Model must be a string or plain object');

        if (!result.ok) return result;
    }
    return result;
}

module.exports = {
    validate: validate
};

