const mocha = require('mocha');
const assert = require('chai').assert;
const index = require('../../functions/index');
describe('index', function() {
    it('Converts Kelvin to Fahrenheit', function () {
        let result = index.KtoF(273.15);
        assert.equal(result, 32)
    })
});