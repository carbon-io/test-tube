var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module)
var testtube = carbon.testtube

__(function() {
  // NOTE: if tests are nested, ensure _main is only invoked on the top
  //       level test if this is run as the main module
  module.exports = o.main({
    _type: testtube.Test,
    name: 'SimpleContextTests',
    description: 'A simple set of tests using context',
    setup: function(context) {
      assert(typeof context.local.testName === 'undefined')
      context.local.testName = this.name
      context.global.testNames = []
    },
    teardown: function(context) {
      assert.equal(context.local.testName, this.name)
      assert.deepEqual(context.global.testNames, [
        'SimpleContextTest',
        'SimpleNestedTestWithContextTest1',
        'SimpleNestedTestWithContextTest2',
        'SimpleAsyncContextTest',
        'SimpleContextTests'
      ])
    },
    doTest: function(context) {
      assert.equal(context.local.testName, this.name)
      context.global.testNames.push(this.name)
    },
    tests: [
      o({
        _type: testtube.Test,
        name: 'SimpleContextTest',
        setup: function(context) {
          assert(typeof context.local.testName === 'undefined')
          context.local.testName = this.name
        },
        teardown: function(context) {
          assert.equal(context.local.testName, this.name)
          assert.deepEqual(context.global.testNames, [
            'SimpleContextTest',
          ])
        },
        doTest: function(context) {
          assert.equal(context.local.testName, this.name)
          context.global.testNames.push(this.name)
        }
      }),
      o({
        _type: testtube.Test,
        name: 'SimpleNestedTestsWithContextTest',
        setup: function(context) {
          assert(typeof context.local.testName === 'undefined')
          context.local.testName = this.name
        },
        teardown: function(context) {
          assert.equal(context.local.testName, this.name)
          assert.deepEqual(context.global.testNames, [
            'SimpleContextTest',
            'SimpleNestedTestWithContextTest1',
            'SimpleNestedTestWithContextTest2',
          ])
        },
        tests: [
          o({
            _type: testtube.Test,
            name: 'SimpleNestedTestWithContextTest1',
            setup: function(context) {
              assert(typeof context.local.testName === 'undefined')
              context.local.testName = this.name
            },
            teardown: function(context) {
              assert.equal(context.local.testName, this.name)
              assert.deepEqual(context.global.testNames, [
                'SimpleContextTest',
                'SimpleNestedTestWithContextTest1',
              ])
            },
            doTest: function(context) {
              assert.equal(context.local.testName, this.name)
              context.global.testNames.push(this.name)
            }
          }),
          o({
            _type: testtube.Test,
            name: 'SimpleNestedTestWithContextTest2',
            setup: function(context) {
              assert(typeof context.local.testName === 'undefined')
              context.local.testName = this.name
            },
            teardown: function(context) {
              assert.equal(context.local.testName, this.name)
              assert.deepEqual(context.global.testNames, [
                'SimpleContextTest',
                'SimpleNestedTestWithContextTest1',
                'SimpleNestedTestWithContextTest2',
              ])
            },
            doTest: function(context) {
              assert.equal(context.local.testName, this.name)
              context.global.testNames.push(this.name)
            }
          })
        ]
      }),
      o({
        _type: testtube.Test,
        name: 'SimpleAsyncContextTest',
        setup: function(context, done) {
          assert(typeof context.local.testName === 'undefined')
          var self = this
          setImmediate(function() {
            context.local.testName = self.name
            done()
          })
        },
        teardown: function(context, done) {
          var self = this
          setImmediate(function() {
            var err = undefined
            try {
              assert.equal(context.local.testName, self.name)
              assert.deepEqual(context.global.testNames, [
                'SimpleContextTest',
                'SimpleNestedTestWithContextTest1',
                'SimpleNestedTestWithContextTest2',
                'SimpleAsyncContextTest',
              ])
            } catch (e) {
              err = e
            }
            done(err)
          })
        },
        doTest: function(context, done) {
          var self = this
          setImmediate(function() {
            var err = undefined
            try {
              assert.equal(context.local.testName, self.name)
              context.global.testNames.push(self.name)
            } catch (e) {
              err = e
            }
            done(err)
          })
        },
      })
    ]
  })
})

