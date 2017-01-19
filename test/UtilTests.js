var assert = require('assert')

var _ = require('lodash')
var sinon = require('sinon')

var o = require('@carbon-io/atom').o(module).main

var Test = require('../lib/Test')
var util = require('../lib/util')

/******************************************************************************
 * UtilTests
 */
UtilTests = o({

  /**********************************************************************
   * _type
   */
  _type: Test,

  /**********************************************************************
   * name
   */
  name: "TestTests",

  /**********************************************************************
   * tests
   */
  tests: [
    o({
      _type: Test,
      name: 'SkipTestConvenienceClassTest',
      description: 'test the SkipTest convenience class',
      setup: function() {
        this.sandbox = sinon.sandbox.create()
        this.sandbox.stub(Test.prototype, '_log', function() {})
      },
      teardown: function() {
        this.sandbox.restore()
      },
      doTest: function() {
        var predicate = false
        var doTest = function() {
          var test = o({
            _type: '../lib/Test',
            name: 'Foo',
            description: 'foo',
            tests: [
              predicate ? o({
                _type: '../lib/Test', 
                name: 'Bar',
                doTest: function() {}
              }) : o({
                _type: util.SkipTest
              })
            ]
          })
          return test.run()
        }
        var result = doTest()
        assert(result.tests[0].passed)
        assert(result.tests[0].skipped)
        assert.equal(result.tests[0].name, 'SkipTest')
        assert(!_.isUndefined(result.tests[0].error))
        assert(result.tests[0].error.name, 'SkipTestError')
        predicate = true
        result = doTest()
        assert(result.tests[0].passed)
        assert(!result.tests[0].skipped)
        assert.equal(result.tests[0].name, 'Bar')
        assert(_.isUndefined(result.tests[0].error))
      }
    })
  ]
})

module.exports = UtilTests

