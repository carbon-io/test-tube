var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module)
var testtube = carbon.testtube

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'SimpleAsyncTest',
    description: 'A simple async test',
    setup: function(_, done) {
      setImmediate(function() {
        // setup the environment for the test
        process.env.foo = 1
        done()
      })
    },
    teardown: function(_, done) {
      setImmediate(function() {
        // clean up the environment for subsequent tests
        delete process.env.foo
        done()
      })
    },
    doTest: function(_, done) {
      setImmediate(function() {
        var err = undefined
        try {
          // test that foo is in the environment and that it is set to 1
          assert.equal(process.env.foo, 1)
        } catch (e) {
          err = e
        }
        done(err)
      })
    }
  })
})

