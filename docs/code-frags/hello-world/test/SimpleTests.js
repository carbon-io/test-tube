var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module)
var testtube = carbon.testtube

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'SimpleTests',
    description: 'A simple set of tests',
    tests: [
      o({
        _type: testtube.Test,
        name: 'SimpleWithSetupAndTeardownTest',
        setup: function() {
          this.x = 1
        },
        doTest: function() {
          assert.equal(this.x, 1)
        },
        teardown: function() {
          delete this.x
        }
      }),
      o({
        _type: testtube.Test,
        name: 'SimpleAsyncTest',
        doTest: function(_, done) {
          setImmediate(function() {
            var err = undefined
            try {
              assert.equal(1, 1)
            } catch (e) {
              err = e
            }
            done(err)
          })
        }
      }),
      o({
        _type: testtube.Test,
        name: 'SimpleAsyncWithSetupAndTeardownTest',
        setup: function(_, done) {
          var self = this
          setImmediate(function() {
            self.x = 1
            done()
          })
        },
        doTest: function(_, done) {
          var self = this
          setImmediate(function() {
            var err = undefined
            try {
              assert.equal(self.x, 1)
            } catch (e) {
              err = e
            }
            done(err)
          })
        },
        teardown: function(_, done) {
          var self = this
          setImmediate(function() {
            delete self.x
            done()
          })
        }
      })
    ]
  })
})

