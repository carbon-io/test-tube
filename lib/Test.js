var o = require('atom').o(module)
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('@carbon-io/fibers').__(module)
var _ = require('lodash')
var colour = require('colour')
var path = require('path')

/******************************************************************************
 * @class Test
 */
module.exports = oo({

  /**********************************************************************
   * _C
   */
  _C: function() {
    this.name = path.basename(module.filename, path.extname(module.filename)) // name of this file without ext
    this.tests = []
    this.description = undefined
    this.errorExpected = false
    this.selfBeforeChildren = false
  },

  /**********************************************************************
   * _init
   */
  _init: function() {
  },

  /**********************************************************************
   * cmdargs
   */     
  cmdargs: {},

  /**********************************************************************
   * _main
   */     
  _main: function(options) {
    var self = this
    this._log(`Running ${this.name}...`.bold)
    this.run(function(err, result) {
      if (err) {
        console.log(err.stack)
      }
      self._log("")
      self.generateReport(result)
      if (!result.passed) {
        process.exit(1)
      }
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
   *
   * @returns {Object} result
   */       
  run: function(done) {
    var self = this

    // initialize result
    var result = {
      name: self.name,
      description: self.description,
      passed: true,
      error: undefined,
      self: undefined,
      time: 0,
      tests: undefined,
    }

    if (done) {
      __(function() {
        try {
          done(null, self.run())
        } catch (e) {
          if (!self.errorExpected) {
            result.passed = false
            result.error = e
          }
          done(e, result)
        }
      })
      return
    }

    try {
      // Setup
      if (self.setup.length > 0) { // cb expected
        self.sync.setup()
      } else if (self.setup.length === 0) {
        self.setup()
      }

      var selfTest = function() {
        if (self.doTest) {
          var selfResult = self._runSelf()
          result.self = selfResult
          result.time = result.time + selfResult.time
          result.error = selfResult.error 
          result.passed = result.passed && selfResult.passed
        }
      }

      // self
      if (self.selfBeforeChildren) {
        selfTest()
      }
      
      // children
      if (this.tests) {
        result.tests = []
        this.tests.forEach(function(test) {
          var childResult = test.sync.run()
          result.tests.push(childResult)
          result.time = result.time + childResult.time
          result.passed = result.passed && childResult.passed
        })
      }
      
      // self
      if (!self.selfBeforeChildren) {
        selfTest()
      }
    } catch (e) {
      if (!self.errorExpected) {
        result.passed = false // belt & suspenders
        result.error = e
      } else {
        result.passed = true
        result.error = undefined
      }
    } finally {
      // Teardown
      if (self.teardown.length > 0) { // cb expected
        self.sync.teardown()
      } else if (self.teardown.length === 0) {
        self.teardown()
      }
    }
    
    if (result.passed) {
      this._log("  [" + "*".green + "] " + this.name + " (" + result.time + "ms)")
    } else {
      this._log("  [" + "-".red + "] " + this.name + " (" + result.time + "ms) " + "FAILURE".red) 
    }

    return result
  },

  /**********************************************************************
   * _runSelf
   *
   * @returns {Object} result
   */       
  _runSelf: function() {
    var self = this
    var result = {
      passed: false,
      error: undefined,
      time: undefined
    }

    try {
      // Start timer
      var startTime = (new Date()).getTime()

      // Call doTest
      if (self.doTest.length > 0) { // cb expected
        self.sync.doTest()
      } else if (self.doTest.length == 0) { // no cb expected
        self.doTest()
      }
      
      result.passed = true
    } catch (e) {
      if (!self.errorExpected) {
        result.passed = false // belt & suspenders
        result.error = e
      } else {
        result.passed = true
        result.error = undefined
      }
    } finally {
      // Stop timer
      var endTime = (new Date()).getTime()
      result.time = endTime - startTime
    }

    return result
  },

  /**********************************************************************
   * _log
   */    
  _log: function(msg, level) {
    level = level || 0
    var header = ""
    for (var i = 0; i < level; i++) {
      header += "  "
    }

    console.log(header + msg)
  },

  /**********************************************************************
   * generateReport
   */    
  generateReport: function(result) {
    if (result) {
      console.log("Test Report".bold)
      this._generateReportHelper(result, 0)
    }
  },

  /**********************************************************************
   * _generateReportHelper
   */    
  _generateReportHelper: function(result, level) {
    var self = this

    if (result) {
      var message = ""
      var statusColor = undefined
      if (result.passed) {
        statusColor = "green"
      } else {
        statusColor = "red"
      }
      message = `[${"*"[statusColor]}]`
      message += ` Test: ${result.name}`
      if (result.description) {
        message += ` (${result.description})`
      }

      // time
      message += ` (${result.time}ms)`

      this._log(message, level)

      if (result.error) {
        this._log(result.error.stack.bold, level + 1)
      }

      _.forEach(result.tests, function(r) {
        self._generateReportHelper(r, level + 1)
      })
    }
  }
})


