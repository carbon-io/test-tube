var o = require('atom').o(module)
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('fiber').__
var _ = require('lodash')

/******************************************************************************
 * @class Test
 */
module.exports = oo({

  /**********************************************************************
   * _C
   */
  _C: function() {
    this.name = undefined
    this.description = undefined
  },

  /**********************************************************************
   * cmdargs
   */     
  cmdargs: {},

  /**********************************************************************
   * _main
   */     
  _main: function(options) {
    this.run(function(err) {
      if (err) {
        console.log("Error: " + err)
      }
      console.log("Complete")
    })
  },

  /**********************************************************************
   * run
   */       
  run: function(done) {
    var self = this

    if (done) {
      __(function() {
        try {
          self.run()
          done()
        } catch (e) {
          done(e)
        }
      })
      return
    }

    console.log("RUNNING TEST: " + self.name)
    if (self.doTest.length === 1) { // cb expected
      self.sync.doTest()
    } else if (self.doTest.length == 0) { // no cb expected
      self.doTest()
    }
    console.log("TEST DONE: " + self.name)
  },

  /**********************************************************************
   * doTest
   */       
  doTest: function(done) {
    done()
  },

})
