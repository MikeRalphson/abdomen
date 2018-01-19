const assert = require('assert');
const util = require('util');
const abdomen = require('../index.js');

// string, boolean, number, integer, array, object, null and variable

const primitives = [
    { desc: "string is string", obj: "hello", model: { type: "string" }, ok: true }
];

describe('expanded',function(){
    describe('primitives',function(){
        for (let f of primitives) {
            it(f.desc,function(){
                let result = abdomen.validate(f.obj,f.model,f.defs,{raw:true});
                if (f.skip) this.skip();
                assert(f.ok ? result.ok : !result.ok, result.message);
            });
        }
    });
});

