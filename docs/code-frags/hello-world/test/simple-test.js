var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module).main
var testtube = carbon.testtube

module.exports = __(function() {
  return o({
    _type: testtube.Test,
    name: 'SimpleTest',
    description: 'A simple bare bones test',
    doTest: function() {
      assert.equal(1, 1)
    }
  })
})
