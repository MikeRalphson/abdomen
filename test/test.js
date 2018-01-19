const assert = require('assert');
const util = require('util');
const abdomen = require('../index.js');

// string, boolean, number, integer, array, object, null and variable

const primitives = [
    { desc: "string is string", obj: "hello", model: "$", ok: true },
    { desc: "empty string is string", obj: "", model: "$", ok: true },
    { desc: "string matches any", obj: "hello", model: "*", ok: true },
    { desc: "string not boolean", obj: "hello", model: "b", ok: false },
    { desc: "string not number", obj: "hello", model: "#", ok: false },
    { desc: "string not integer", obj: "hello", model: "0", ok: false },
    { desc: "string not array", obj: "hello", model: "[]", ok: false },
    { desc: "string not object", obj: "hello", model: "{}", ok: false },
    { desc: "string not null", obj: "hello", model: "!", ok: false },
    { desc: "empty string not null", obj: "", model: "!", ok: false },
    { desc: "string not null, literally", obj: "null", model: "!", ok: false },
    { desc: "true is boolean", obj: true, model: "b", ok: true },
    { desc: "false is boolean", obj: false, model: "b", ok: true },
    { desc: "boolean matches any", obj: true, model: "*", ok: true },
    { desc: "boolean not string", obj: true, model: "$", ok: false },
    { desc: "boolean not number", obj: true, model: "#", ok: false },
    { desc: "boolean not integer", obj: true, model: "0", ok: false },
    { desc: "boolean not array", obj: true, model: "[]", ok: false },
    { desc: "boolean not object", obj: true, model: "{}", ok: false },
    { desc: "boolean not null", obj: true, model: "!", ok: false },
    { desc: "nullable boolean, yes", obj: null, model: "b-", ok: true },
    { desc: "nullable boolean, no", obj: true, model: "b-", ok: true },
    { desc: "zero is number", obj: 0, model: "#", ok: true },
    { desc: "-1 is number", obj: -1, model: "#", ok: true },
    { desc: "1 is number", obj: 1, model: "#", ok: true },
    { desc: "1.0 is number", obj: 1.0, model: "#", ok: true },
    { desc: "1.1 is number", obj: 1.1, model: "#", ok: true },
    { desc: "number matches any", obj: 0, model: "*", ok: true },
    { desc: "number not string", obj: 0, model: "$", ok: false },
    { desc: "1.1 not integer", obj: 1.1, model: "0", ok: false },
    { desc: "number not array", obj: 0, model: "[]", ok: false },
    { desc: "number not object", obj: 0, model: "{}", ok: false },
    { desc: "number not null", obj: 0, model: "!", ok: false },
    { desc: "zero is integer", obj: 0, model: "0", ok: true },
    { desc: "integer matches any", obj: 0, model: "*", ok: true },
    { desc: "integer not string", obj: 0, model: "$", ok: false },
    { desc: "integer not boolean", obj: 0, model: "b", ok: false },
    { desc: "integer is number", obj: 0, model: "#", ok: true },
    { desc: "integer not array", obj: 0, model: "[]", ok: false },
    { desc: "integer not object", obj: 0, model: "{}", ok: false },
    { desc: "integer not null", obj: 0, model: "!", ok: false },
    { desc: "array is array", obj: [0], model: "[]", ok: true },
    { desc: "empty array is array", obj: [], model: "[]", ok: true },
    { desc: "array matches any", obj: [], model: "*", ok: true },
    { desc: "array not string", obj: [], model: "$", ok: false },
    { desc: "array not boolean", obj: [], model: "b", ok: false },
    { desc: "array not number", obj: [], model: "#", ok: false },
    { desc: "array not integer", obj: [], model: "0", ok: false },
    { desc: "array not object", obj: [], model: "{}", ok: false },
    { desc: "array not null", obj: [], model: "!", ok: false },
    { desc: "empty object is object", obj: {}, model: "{}", ok: true },
    { desc: "object is object", obj: {"p":0}, model: "{}", ok: true },
    { desc: "object matches any", obj: {"p":0}, model: "*", ok: true },
    { desc: "object not string", obj: {}, model: "$", ok: false },
    { desc: "object not boolean", obj: {}, model: "b", ok: false },
    { desc: "object not number", obj: {}, model: "#", ok: false },
    { desc: "object not integer", obj: {}, model: "0", ok: false },
    { desc: "object not array", obj: {}, model: "[]", ok: false },
    { desc: "object not null", obj: {}, model: "!", ok: false },
];

const objects = [
    { desc: "object match", obj: { "hello": "sailor" }, model: { "hello": "$" }, ok: true },
    { desc: "object optional, present", obj: { "hello": "sailor" }, model: { "hello": "$?" }, ok: true },
    { desc: "object optional, missing", obj: { "goodbye": "dolly" }, model: { "hello": "$?" }, ok: true },
    { desc: "object mismatch", obj: { "goodbye": "dolly" }, model: { "hello": "$" }, ok: false },
    { desc: "object null", obj: { "hello": null }, model: { "hello": "$?" }, ok: false },
    { desc: "object all strings, 0", obj: {}, model: { "*": "$" }, ok: true },
    { desc: "object all strings, 1", obj: { "hello": "sailor" }, model: { "*": "$" }, ok: true },
    { desc: "object all strings, 2", obj: { "hello": "sailor", "goodbye": "dolly" }, model: { "*": "$" }, ok: true },
    { desc: "object all strings, mixed", obj: { "hello": "sailor", "goodbye": true }, model: { "*": "$" }, ok: false },
    { desc: "nested object, objects", obj: { a: {}, b: {} }, model: { "*": "{}" }, ok: true },
    { desc: "nested object, not objects", obj: { a: 1, b: false }, model: { "*": "{}" }, ok: false },
    { desc: "nested object, arrays", obj: { a: [], b: [] }, model: { "*": "[]" }, ok: true },
    { desc: "nested object, arrays, specific", obj: { a: [], b: [] }, model: { "a": "[]", "b": "[]" }, ok: true },
    { desc: "nested object, arrays, mixed", obj: { a: [], b: "hello" }, model: { "a": "[]", "b": "$" }, ok: true },
    { desc: "nested object, deeper", obj: { a: [], b: { c: "hello" } }, model: { "a": "[]", "b": "{}" }, ok: true },
    { desc: "nested object, deeper, typed", obj: { a: [], b: { c: "hello" } }, model: { "a": "[]", "b": "{\"c\":\"$\"}" }, ok: true },
    { desc: "nested object, missing ref", obj: { a: [], b: { c: "hello" } }, model: { "a": "[]", "b": "{(#/defs/inner)}" }, ok: false },
    { desc: "nested object, ref", obj: { a: [], b: { c: "hello" } }, model: { "a": "[]", "b": "{(#/defs/inner)}" }, ok: true, defs: { defs: { "inner": { "c": "$" } } } },
    { desc: "nested object, ref mismatch", obj: { a: [], b: { c: "hello" } }, model: { "a": "[]", "b": "{(#/defs/inner)}" }, ok: false, defs: { defs: { "inner": { "c": "0" } } } },
    { desc: "nested object, ref deeper", obj: { a: [], b: { c: { d: "hello" } } }, model: { "a": "[]", "b": "{(#/defs/inner)}" }, ok: true, defs: { defs: { "inner": { "c": "{(#/defs/deeper)}" }, "deeper": { "d": "$" } } } },
    { desc: "nested object, ref deeper mismatch", obj: { a: [], b: { c: { d: true } } }, model: { "a": "[]", "b": "{(#/defs/inner)}" }, ok: false, defs: { defs: { "inner": { "c": "{(#/defs/deeper)}" }, "deeper": { "d": "$" } } } }
];

const arrays = [
    { desc: "array with string", obj: ["hello"], model: [ "$" ], ok: true },
    { desc: "array with variable", obj: ["hello"], model: [ "*" ], ok: true },
    { desc: "array with string not booleans", obj: ["hello"], model: [ "b" ], ok: false },
    { desc: "array with string not numbers", obj: ["hello"], model: [ "#" ], ok: false },
    { desc: "array with string not integers", obj: ["hello"], model: [ "0" ], ok: false },
    { desc: "array with string not arrays", obj: ["hello"], model: [ "[]" ], ok: false },
    { desc: "array with string not objects", obj: ["hello"], model: [ "{}" ], ok: false },
    { desc: "array of strings", obj: ["hello","goodbye"], model: [ "$" ], ok: true },
    { desc: "empty array matches string", obj: [], model: [ "$" ], ok: true },
    { desc: "array with true", obj: [true], model: [ "b" ], ok: true },
    { desc: "array with false", obj: [false], model: [ "b" ], ok: true },
    { desc: "array of booleans", obj: [true,false], model: [ "b" ], ok: true },
    { desc: "array of arrays", obj: [[],[]], model: [ "[]" ], ok: true },
    { desc: "empty array matches boolean", obj: [], model: [ "b" ], ok: true },
    { desc: "empty array matches variable", obj: [], model: [ "*" ], ok: true },
    { desc: "nested array, missing ref", obj: [ { a: "hello" }, { b: "goodbye" } ], model: [ "[(#/defs/inner)]" ], ok: false },
    { desc: "nested array 1, ref", obj: [ { a: "hello" } ], model: [ "{(#/defs/inner)}" ], ok: true, defs: { defs: { "inner": { "a": "$" } } } },
    { desc: "nested array, ref", obj: [ { a: "hello" }, { b: "hello" } ], model: [ "{(#/defs/inner)}" ], ok: true, defs: { defs: { "inner": { "*": "$" } } } },
    { desc: "nested array, ref mismatch", obj: [ [], { c: "hello" } ], model: [ "[]", "{(#/defs/inner)}" ], ok: false, defs: { defs: { "inner": { "c": "0" } } } },
    { desc: "nested array, ref array", obj: [ [], [ "hello", "sailor"] ], model: [ "[]", "[(#/defs/inner)]" ], ok: true, defs: { defs: { "inner": [ "$" ] } } },
    { desc: "nested array, ref array mismatch", obj: [ [], [ "hello", true ] ], model: [ "[]", "[(#/defs/inner)]" ], ok: true, defs: { defs: { "inner": [ "$" ] } } },
];

const minmax = [
    { desc: "string with min", obj: "hello", model: "$>0", ok: true },
    { desc: "empty string with min", obj: "", model: "$>0", ok: false },
    { desc: "string with min, same", obj: "hello", model: "$>5", ok: false },
    { desc: "string with min, less", obj: "hello", model: "$>6", ok: false },
    { desc: "string with max", obj: "hello", model: "$<6", ok: true },
    { desc: "empty string with max", obj: "", model: "$<1", ok: true },
    { desc: "string with max, under", obj: "hello", model: "$<6", ok: true },
    { desc: "string with max, same", obj: "hello", model: "$<5", ok: false },
    { desc: "string with max, more", obj: "hello sailor", model: "$<6", ok: false },
    { desc: "integer with min, more", obj: 1, model: "0>0", ok: true },
    { desc: "integer with min, same", obj: 1, model: "0>1", ok: false },
    { desc: "integer with min, less", obj: 1, model: "0>2", ok: false },
    { desc: "integer with max, less", obj: 0, model: "0<1", ok: true },
    { desc: "integer with max, same", obj: 1, model: "0<1", ok: false },
    { desc: "integer with max, more", obj: 2, model: "0<1", ok: false },
    { desc: "number with min, more", obj: 1.0, model: "#>0", ok: true },
    { desc: "number with min, same", obj: 1.0, model: "#>1.0", ok: false },
    { desc: "number with min, less", obj: 1.0, model: "#>1.1", ok: false },
    { desc: "number with max, less", obj: 0.4, model: "#<0.5", ok: true },
    { desc: "number with max, same", obj: 2.3, model: "#<2.3", ok: false },
    { desc: "number with max, more", obj: 2.4, model: "#<2.4", ok: false },
    { desc: "array with min, more", obj: ["hello"], model: "[]>0", ok: true },
    { desc: "array with min, same", obj: [0], model: "[]>1", ok: false },
    { desc: "array with min, less", obj: [false], model: "[]>1", ok: false },
    { desc: "array with max, less", obj: [], model: "[]<1", ok: true },
    { desc: "array with max, same", obj: ["hello","sailor"], model: "[]<2", ok: false },
    { desc: "array with max, more", obj: [true,false], model: "[]<1", ok: false }
];

const enums = [
    { desc: "string with empty enums", obj: "hello", model: "$=[]=", ok: true },
    { desc: "string with enums, match", obj: "hello", model: '$=["hello"]=', ok: true },
    { desc: "string with enums, missing", obj: "hello", model: "b=[\"goodbye\",\"seeya\"]=", ok: false },
    { desc: "boolean with empty enums", obj: true, model: "b=[]=", ok: true },
    { desc: "boolean with enums, match", obj: true, model: 'b=[true,false]=', ok: true },
    { desc: "boolean with enums, missing", obj: false, model: "b=[true]=", ok: false }
];

describe('primitives',function(){
    for (let f of primitives) {
        it(f.desc,function(){
            let result = abdomen.validate(f.obj,f.model);
            if (f.skip) this.skip();
            assert(f.ok ? result.ok : !result.ok, result.message);
        });
    }
});

describe('objects',function(){
    for (let f of objects) {
        it(f.desc,function(){
            let result = abdomen.validate(f.obj,f.model,f.defs);
            if (f.skip) this.skip();
            assert(f.ok ? result.ok : !result.ok, result.message);
        });
    }
});

describe('arrays',function(){
    for (let f of arrays) {
        it(f.desc,function(){
            let result = abdomen.validate(f.obj,f.model,f.defs);
            if (f.skip) this.skip();
            assert(f.ok ? result.ok : !result.ok, util.inspect(result,{depth:null}));
        });
    }
});

describe('minmax',function(){
    for (let f of minmax) {
        it(f.desc,function(){
            let result = abdomen.validate(f.obj,f.model);
            if (f.skip) this.skip();
            assert(f.ok ? result.ok : !result.ok, util.inspect(result,{depth:null}));
        });
    }
});

describe('enums',function(){
    for (let f of enums) {
        it(f.desc,function(){
            let result = abdomen.validate(f.obj,f.model);
            if (f.skip) this.skip();
            assert(f.ok ? result.ok : !result.ok, util.inspect(result,{depth:null}));
        });
    }
});

