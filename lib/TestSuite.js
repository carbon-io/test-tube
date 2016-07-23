var o = require('atom').o(module)
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('@carbon-io/fibers').__(module)
var _ = require('lodash')

/******************************************************************************
 * @class TestSuite
 */
module.exports = oo({

  /**********************************************************************
   * _type
   */
  _type: './Test',

  /**********************************************************************
   * _C
   */
  _C: function() {
    this.tests = []
  },

  /**********************************************************************
   * doTest
   */       
  doTest: function() {
    if (this.tests) {
      this.tests.forEach(function(test) {
        test.sync.run()
      })
    }
  }

})
