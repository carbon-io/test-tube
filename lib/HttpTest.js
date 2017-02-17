var assert = require('assert')

var _ = require('lodash')

var EJSON = require('@carbon-io/ejson')
var HttpError = require('@carbon-io/http-errors').HttpError
var __ = require('@carbon-io/fibers').__(module)
var _o = require('@carbon-io/bond')._o(module)
var o = require('@carbon-io/atom').o(module)
var oo = require('@carbon-io/atom').oo(module)

var Test = require('./Test')
var HttpTestHistory = require('./HttpTestHistory')

/******************************************************************************
 * @class HttpTest
 */
module.exports = oo({

  /**********************************************************************
   * _type
   */
  _type: Test,

  /**********************************************************************
   * _C
   */
  _C: function() {
    this.baseUrl = undefined
    this.tests = []
    this._history = undefined
  },

  /**********************************************************************
   * _init
   */
  _init: function() {
    Test.prototype._init.call(this)
  },

  /**********************************************************************
   * run
   */
  run: function(done) {
    var restore = false

    // XXX: necessary to run HttpTests directly using run
    this._initContext()

    if (_.isUndefined(this._history)) {
      restore = true
      this._history = this.context.stashHttpHistory(new HttpTestHistory())
    }
    try {
      return Test.prototype.run.call(this, done)
    } finally {
      if (restore) {
        this.context.restoreHttpHistory()
      }
    }
  },

  /**********************************************************************
   * _initTests
   */
  _initTests: function() {
    var self = this

    var result = []
    _.forEach(self.tests, function(test) {
      if (!(test instanceof Test)) {
        // Test name
        var testName = test.name
        if (!testName) {
          if (typeof(reqSpec) === 'function') {
            testName = "*DYNAMIC TEST*"
          } else {
            testName = `${test.reqSpec.method} ${test.reqSpec.url}`
          }
        }

        var _test = {
          _type: Test,
          name: testName,
          errorExpected: test.errorExpected,
          reqSpec: test.reqSpec,
          resSpec: test.resSpec,
          doTest: function() {
            try {
              var response = self.sync._executeHttpTest(test, self._history)
            } finally {
              self._history.addReq(test.name, response ? response.req : undefined)
              self._history.addRes(test.name, response)
            }
          }
        }
        if (test.setup) {
          _test.setup = test.setup
        }
        if (test.teardown) {
          _test.teardown = test.teardown
        }
        test = o(_test)
      }
      result.push(test)
    })

    self.tests = result

    Test.prototype._initTests.call(this)
  },

  /**********************************************************************
   * _executeHttpTest
   */
  _executeHttpTest: function(test, history, cb) {
    var url = undefined
    var options = test.reqSpec.options || {}
    var reqSpec = test.reqSpec
    var resSpec = test.resSpec

    var _cb = function() {
      history.addResSpec(test.name, resSpec)
      history.addReqSpec(test.name, _.merge(_.cloneDeep(reqSpec), {url: url}))
      return cb.apply(null, arguments)
    }
    
    if (typeof(reqSpec) === 'function') {
      return this._executeHttpTest(
        { 
          name: test.name || `${reqSpec.method} ${reqSpec.url}`,
          reqSpec: reqSpec.call(test, history), 
          resSpec: resSpec 
        },
        history, 
        cb)
    }
    
    if (!reqSpec.url) {
      if (!this.baseUrl) {
        return _cb(new Error("Request spec must provide a url."))
      } else {
        url = this.baseUrl
      }
    } else { // we have reqSpec.url
      if (this.baseUrl) {
        if (_.startsWith(reqSpec.url, "http://") || _.startsWith(reqSpec.url, "https://")) {
          url = reqSpec.url
        } else {
          // concat
          url = this.baseUrl + reqSpec.url
        }
      } else { // no baseUrl
        url = reqSpec.url
      }
    }
    
    if (!reqSpec.method) {
      return _cb(new Error("Request spec must provide a method."))
    }

    var endpoint = _o(url, options)
    // XXX want better method to invoke here. This is private and hacky
    return endpoint._performOperation(reqSpec.method.toLowerCase(), [
      reqSpec.body, 
      { 
        params: reqSpec.parameters,
        headers: reqSpec.headers,
        json: reqSpec.json,
        strictSSL: reqSpec.strictSSL
      }, 
      function(err, response) {
        if (err && !(err instanceof HttpError)) { // If HttpError we don't freak and let the test do the testing
          return _cb(err, null)
        }

        try {
          if (typeof(resSpec) === 'function') {
            // XXX: if old tests are relying on returning true to indicate success,
            //      throw an error instructing the maintainer to instead throw an 
            //      error to indicate failure and fail the test. the check here
            //      may be too weak...
            if (resSpec.toString().match(/\s+return\s+/)) {
              throw new Error('if resSpec is a function, throw an error to ' +
                              'indicate failure rather than returning true to ' +
                              'indicate success')
            }
            resSpec.call(test, response, history)
          } else {
            _.forEach(resSpec, function(valueSpec, fieldName) {
              var value = response[fieldName]
              if (typeof(valueSpec) === 'function') {
                if (valueSpec.toString().match(/\s+return\s+/)) {
                  throw new Error('if resSpec.valueSpec is a function, throw ' +
                                  'an error to indicate failure rather than ' +
                                  'returning true to indicate success')
                }
                try {
                  valueSpec.call(test, value)
                } catch (e) {
                  e.message = "Assertion failed for field '" + fieldName + 
                              "' with value '" + value + "': " + e.message
                  throw e
                }
              } else {
                assert.deepEqual(valueSpec, value, EJSON.stringify(test) + 
                                                   " Response body: " + 
                                                   JSON.stringify(response.body))
              }
            })
          }
        } catch (e) {
          return _cb(e)
        }
        
        return _cb(null, response)
      }])
  },
})
