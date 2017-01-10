var assert = require('assert')

var sinon = require('sinon')

var EJSON = require('@carbon-io/ejson')
var o = require('@carbon-io/atom').o(module).main

var SkipTestError = require('../lib/errors').SkipTestError

/******************************************************************************
 * TestTests
 */
module.exports = o({

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
            })
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
      }
    })
  ]
})
