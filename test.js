const abdomen = require('./index.js');

const obj = { "hello": "sailor" };
const obj2 = { "goodbye": "dolly" };
const obj3 = { "hello": null };
const model = { "hello": "a?" };

console.log(abdomen.validate(obj,model));
console.log(abdomen.validate(obj2,model));
console.log(abdomen.validate(obj3,model));
