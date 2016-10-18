var assert = require('assert')

var EJSON = require('ejson')
var o = require('@carbon-io/atom').o(module).main

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
    })
  ]
})
