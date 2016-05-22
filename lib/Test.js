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
   * setup
   */       
  setup: function(done) {
    done()
  },

  /**********************************************************************
   * teardown
   */       
  teardown: function(done) {
    done()
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

    console.log("TEST: " + self.name)

    // Setup
    console.log("SETUP TEST: " + self.name)
    if (self.setup.length > 0) { // cb expected
      self.sync.setup()
    } else if (self.setup.length === 0) {
      self.setup()
    }

    // Call doTest
    if (self.doTest.length > 0) { // cb expected
      self.sync.doTest()
    } else if (self.doTest.length == 0) { // no cb expected
      self.doTest()
    }

    // Teardown
    console.log("TEARDOWN TEST: " + self.name)
    if (self.teardown.length > 0) { // cb expected
      self.sync.teardown()
    } else if (self.teardown.length === 0) {
      self.teardown()
    }


    console.log("TEST: " + self.name + " - DONE (SUCCESS)")
  },

  /**********************************************************************
   * doTest
   */       
  doTest: function(done) {
    done()
  },

})
