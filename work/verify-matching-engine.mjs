import assert from 'node:assert/strict';
// Independent arithmetic reference; the browser engine receives its own regression tests.
const similarity = (answer, position) => 1 - Math.abs(answer - position) / 4;
assert.equal(similarity(-2, 2), 0);
assert.equal(similarity(0, 2), 0.5);
assert.equal(100 * (2 * similarity(2, 2) + similarity(2, -2)) / 3, 200 / 3);
console.log('Reference arithmetic: extremes, neutral and fixed weighted example passed.');
