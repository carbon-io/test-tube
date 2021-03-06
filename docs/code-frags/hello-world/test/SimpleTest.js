var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module)
var o = carbon.atom.o(module)
var testtube = carbon.testtube

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'SimpleTest',
    description: 'A simple test',
    setup: function() {
      // setup the environment for the test
      process.env.foo = 1
    },
    teardown: function() {
      // clean up the environment for subsequent tests
      delete process.env.foo
    },
    doTest: function() {
      // test that foo is in the environment and that it is set to 1
      assert.equal(process.env.foo, 1)
    }
  })
})
