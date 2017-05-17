var assert = require('assert')

var _ = require('lodash')
var sinon = require('sinon')

var __ = require('@carbon-io/fibers').__(module)
var EJSON = require('@carbon-io/ejson')
var o = require('@carbon-io/atom').o(module)
var oo = require('@carbon-io/atom').oo(module)

var SkipTestError = require('../lib/errors').SkipTestError
var NotImplementedError = require('../lib/errors').NotImplementedError

var ContextStateStashRestoreTest = oo({
  _type: '../lib/Test',
  description: 'Test that context local is stashed and restored',
  setup: function(context) {
    assert.equal(_.keys(context.local).length, 0)
    context.local.foo = this.name
  },
  teardown: function(context) {
    assert.equal(_.keys(context.local).length, 2)
    assert.equal(_.intersection(_.keys(context.local),
                                ['foo', 'bar']).length,
                 2)
    assert.equal(context.local.foo, this.name)
    assert.equal(context.local.bar, this.name)
  },
  doTest: function(context) {
    assert.equal(_.keys(context.local).length, 1)
    assert.equal(_.intersection(_.keys(context.local),
                                ['foo']).length,
                 1)
    assert.equal(context.local.foo, this.name)
    context.local.bar = this.name
  },
})

/******************************************************************************
 * TestTests
 */
__(function() {
  module.exports = o.main({

    /**********************************************************************
     * _type
     */
    _type: '../lib/Test',

    /**********************************************************************
     * name
     */
    name: "TestTests",

    /**********************************************************************
     * tests
     */
    tests: [
      o({
        _type: '../lib/Test',
        name: 'EJSONStringifyWithCircularReferenceTest',
        description: 'Test EJSON#stringify works with circular parent reference',
        doTest: function() {
          assert.equal(EJSON.stringify(this), JSON.stringify(this))
        }
      }),
      o({
        _type: '../lib/Test',
        name: 'SkipTestErrorTest',
        description: 'Test that SkipTestError does not fail the test, but marks it as passed/skipped',
        setup: function() {
          var self = this
          this.sandbox = sinon.sandbox.create()
          this.sandbox.stub(process, 'exit', function() {
            throw new Error('exit')
          })
          this._tests = o({
            _type: '../lib/Test',
            name: 'SkipTestErrorTestSuite',
            tests: [
              o({
                _type: '../lib/Test',
                name: 'SetupSkipTestErrorTest',
                doTestRan: false,
                setup: function() {
                  throw new SkipTestError(this.name)
                },
                doTest: function() {
                  this.doTestRan = true
                },
                tests: [
                  o({
                    _type: '../lib/Test',
                    name: 'SetupSkipTestErrorChildTest',
                    doTestRan: false,
                    doTest: function() {
                      this.doTestRan = true
                    }
                  })
                ]
              }),
              o({
                _type: '../lib/Test',
                name: 'ChildrenSkipTestErrorTest',
                doTestRan: false,
                doTest: function() {
                  this.doTestRan = true
                },
                tests: [
                  o({
                    _type: '../lib/Test',
                    name: 'ChildNoSkipTestErrorTest',
                    doTestRan: false,
                    doTest: function() {
                      this.doTestRan = true
                    }
                  }),
                  o({
                    _type: '../lib/Test',
                    name: 'ChildSkipTestErrorTest',
                    doTest: function() {
                      throw new SkipTestError(this.name)
                    }
                  }),
                  o({
                    _type: '../lib/Test',
                    name: 'ChildNoSkipTestErrorAfterSkipTestErrorTest',
                    doTestRan: false,
                    doTest: function() {
                      this.doTestRan = true
                    }
                  })
                ]
              }),
              o({
                _type: '../lib/Test',
                name: 'NotImplementedErrorTest',
                doTest: function() {
                  throw new NotImplementedError('not implemented')
                }
              }),
            ]
          })
          // suppress logging in test suite being tested
          this.sandbox.stub(this._tests, '_log', function() { /* noop */ })
          this._tests.tests.forEach(function(test) {
            self.sandbox.stub(test, '_log', function() { /* noop */ })
            test.tests.forEach(function(test) {
              self.sandbox.stub(test, '_log', function() { /* noop */ })
            })
          })
        },
        teardown: function() {
          this.sandbox.restore()
        },
        doTest: function() {
          var result = this._tests.run()

          // SkipTestErrorTestSuite
          assert(result.passed) 
          assert(!result.skipped)

          // SetupSkipTestErrorTest
          assert(result.tests[0].passed)
          assert(result.tests[0].skipped)
          assert.equal(result.tests[0].skippedTag, SkipTestError.tag)
          assert.equal(result.tests[0].error.message,
                       this._tests.tests[0].name)
          assert(!this._tests.tests[0].doTestRan)

          // SetupSkipTestErrorChildTest
          assert(typeof result.tests[0].tests === 'undefined')
          assert(!this._tests.tests[0].tests[0].doTestRan)

          // ChildrenSkipTestErrorTest
          assert(result.tests[1].passed)
          assert(!result.tests[1].skipped)
          assert(typeof result.tests[1].error === 'undefined')
          assert(this._tests.tests[1].doTestRan)

          // ChildNoSkipTestErrorTest
          assert(result.tests[1].tests[0].passed)
          assert(!result.tests[1].tests[0].skipped)
          assert(typeof result.tests[1].tests[0].error === 'undefined')
          assert(this._tests.tests[1].tests[0].doTestRan)
          
          // ChildSkipTestErrorTest
          assert(result.tests[1].tests[1].passed)
          assert(result.tests[1].tests[1].skipped)
          assert.equal(result.tests[1].tests[1].error.message, 
                       this._tests.tests[1].tests[1].name)
          assert(!this._tests.tests[1].tests[1].doTestRan)

          // ChildNoSkipTestErrorAfterSkipTestErrorTest
          assert(result.tests[1].tests[2].passed)
          assert(!result.tests[1].tests[2].skipped)
          assert(typeof result.tests[1].tests[2].error === 'undefined')
          assert(this._tests.tests[1].tests[2].doTestRan)
          
          // NotImplementedErrorTest
          assert(result.tests[2].passed)
          assert(result.tests[2].skipped)
          assert.equal(result.tests[2].skippedTag, NotImplementedError.tag)
        }
      }),
      o({
        _type: ContextStateStashRestoreTest,
        name: 'contextStateStashRestoreTest',
        tests: [
          o({
            _type: ContextStateStashRestoreTest,
            name: 'contextStateStashRestoreSelfBeforeChildrenSub1Test',
            selfBeforeChildren: true,
            tests: [
              o({
                _type: ContextStateStashRestoreTest,
                name: 'contextStateStashRestoreSubSub1Test',
              }),
              o({
                _type: ContextStateStashRestoreTest,
                name: 'contextStateStashRestoreSubSub2AsyncTest',
                setup: function(context, done) {
                  var self = this
                  setImmediate(function() {
                    try {
                      ContextStateStashRestoreTest.prototype.setup.call(self, context)
                    } catch (e) {
                      return done(e)
                    }
                    return done()
                  })
                },
                teardown: function(context, done) {
                  var self = this
                  setImmediate(function() {
                    try {
                      ContextStateStashRestoreTest.prototype.teardown.call(self, context)
                    } catch (e) {
                      return done(e)
                    }
                    return done()
                  })
                },
                doTest: function(context, done) {
                  var self = this
                  setImmediate(function() {
                    try {
                      ContextStateStashRestoreTest.prototype.doTest.call(self, context)
                    } catch (e) {
                      return done(e)
                    }
                    return done()
                  })
                }
              })
            ]
          }),
          o({
            _type: ContextStateStashRestoreTest,
            name: 'contextStateStashRestoreSub2Test',
          })
        ]
      }),
      o({
        _type: '../lib/Test',
        name: 'UndefinedChildTestError',
        doTest: function() {
          var test = o({
            _type: '../lib/Test',
            name: 'FooTest',
            tests: [
              {},
              o({
                _type: '../lib/Test',
                name: 'BarTest',
                doTest: function() {
                  assert(true)
                }
              })
            ]
          })
          var err = undefined
          var result = undefined
          try {
            result = test.sync.run(undefined)
          } catch (e) {
            err = e
          }
          assert(_.isNil(err))
          assert(!_.isNil(result) && !_.isNil(result.error))
          assert.equal(
            result.error.toString(), 
            'TypeError: Test does not appear to be an instance of ' +
            'testtube.Test. You may be missing "o()", "_type", or ' +
            '"module.exports" may not be set appropriately in a child module.')
        }
      })
    ]
  })
})
