const assert = require('assert');
const abdomen = require('../index.js');

// string, boolean, number, integer, array, object, null

const primitives = [
    { desc: "string is string", obj: "hello", model: "a", ok: true },
    { desc: "empty string is string", obj: "", model: "a", ok: true },
    { desc: "string not boolean", obj: "hello", model: "b", ok: false },
    { desc: "string not number", obj: "hello", model: "#", ok: false },
    { desc: "string not integer", obj: "hello", model: "0", ok: false },
    { desc: "string not array", obj: "hello", model: "[]", ok: false },
    { desc: "string not object", obj: "hello", model: "{}", ok: false },
    { desc: "string not null", obj: "hello", model: "!", ok: false },
    { desc: "true is boolean", obj: true, model: "b", ok: true },
    { desc: "false is boolean", obj: false, model: "b", ok: true },
    { desc: "boolean not string", obj: true, model: "a", ok: false },
    { desc: "boolean not number", obj: true, model: "#", ok: false },
    { desc: "boolean not integer", obj: true, model: "0", ok: false },
    { desc: "boolean not array", obj: true, model: "[]", ok: false },
    { desc: "boolean not object", obj: true, model: "{}", ok: false },
    { desc: "boolean not null", obj: true, model: "!", ok: false },
    { desc: "zero is number", obj: 0, model: "#", ok: true },
    { desc: "-1 is number", obj: -1, model: "#", ok: true },
    { desc: "1 is number", obj: 1, model: "#", ok: true },
    { desc: "1.0 is number", obj: 1.0, model: "#", ok: true },
    { desc: "1.1 is number", obj: 1.1, model: "#", ok: true },
    { desc: "number not string", obj: 0, model: "a", ok: false },
    { desc: "1.1 not integer", obj: 1.1, model: "0", ok: false },
    { desc: "number not array", obj: 0, model: "[]", ok: false },
    { desc: "number not object", obj: 0, model: "{}", ok: false },
    { desc: "number not null", obj: 0, model: "!", ok: false },
    { desc: "zero is integer", obj: 0, model: "0", ok: true },
    { desc: "integer not string", obj: 0, model: "a", ok: false },
    { desc: "integer not boolean", obj: 0, model: "b", ok: false },
    { desc: "integer is number", obj: 0, model: "#", ok: true },
    { desc: "integer not array", obj: 0, model: "[]", ok: false },
    { desc: "integer not object", obj: 0, model: "{}", ok: false },
    { desc: "integer not null", obj: 0, model: "!", ok: false },
    { desc: "empty array is array", obj: [], model: "[]", ok: true },
    { desc: "array is array", obj: [0], model: "[]", ok: true },
    { desc: "array not string", obj: [], model: "a", ok: false },
    { desc: "array not boolean", obj: [], model: "b", ok: false },
    { desc: "array not number", obj: [], model: "#", ok: false },
    { desc: "array not integer", obj: [], model: "0", ok: false },
    { desc: "array not object", obj: [], model: "{}", ok: false },
    { desc: "array not null", obj: [], model: "!", ok: false },
    { desc: "empty object is object", obj: {}, model: "{}", ok: true },
    { desc: "object is object", obj: {"p":0}, model: "{}", ok: true },
    { desc: "object not string", obj: {}, model: "a", ok: false },
    { desc: "object not boolean", obj: {}, model: "b", ok: false },
    { desc: "object not number", obj: {}, model: "#", ok: false },
    { desc: "object not integer", obj: {}, model: "0", ok: false },
    { desc: "object not array", obj: {}, model: "[]", ok: false },
    { desc: "object not null", obj: {}, model: "!", ok: false },
];

const objects = [
    { desc: "object match", obj: { "hello": "sailor" }, model: { "hello": "a?" }, ok: true },
    { desc: "object additional", obj: { "goodbye": "dolly" }, model: { "hello": "a?" }, ok: true },
    { desc: "object null", obj: { "hello": null }, model: { "hello": "a?" }, ok: false },
];

describe('primitives',function(){
    for (let f of primitives) {
        it(f.desc,function(){
            let result = abdomen.validate(f.obj,f.model);
            assert(f.ok ? result.ok : !result.ok, result.message);
        });
    }
});

describe('objects',function(){
    for (let f of objects) {
        it(f.desc,function(){
            let result = abdomen.validate(f.obj,f.model);
            assert(f.ok ? result.ok : !result.ok, result.message);
        });
    }
});

