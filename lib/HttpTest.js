var o = require('@carbon-io/atom').o(module)
var oo = require('@carbon-io/atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('@carbon-io/fibers').__(module)
var _ = require('lodash')
var assert = require('assert')
var EJSON = require('ejson')
var HttpError = require('http-errors').HttpError
var Test = require('../lib/Test')

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
  },

  /**********************************************************************
   * _init
   */
  _init: function() {
    Test.prototype._init.call(this)
  },

  /**********************************************************************
   * _initTests
   */
  _initTests: function() {
    var self = this

    var result = []
    var previousResponse = undefined // This is a nice use of a closure. See what we are doing here?
    _.forEach(self.tests, function(test) {
      if (!(test instanceof Test)) {
        var _test = {
          _type: Test,
          name: `${test.reqSpec.method} ${test.reqSpec.url}`,
          reqSpec: test.reqSpec,
          resSpec: test.resSpec,
          doTest: function() {
            previousResponse = self.sync._executeHttpTest(test, previousResponse)
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
   * doTest
   */
/*
  doTest: function() {
    var self = this
    var previousResponse = undefined

    if (this.tests) {
      self.tests.forEach(function(test) {        
        previousResponse = self.sync._executeHttpTest(test, previousResponse)
      })
    }
  },
*/
  /**********************************************************************
   * _executeHttpTest
   */
  _executeHttpTest: function(test, previousResponse, cb) {
    var url = undefined
    var options = test.reqSpec.options || {}
    var reqSpec = test.reqSpec
    var resSpec = test.resSpec
    if (!reqSpec.url) {
      if (!this.baseUrl) {
        return cb(new Error("Request spec must provide a url."))
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

    if (typeof(reqSpec) === 'function') {
      return this._executeHttpTest({ reqSpec: reqSpec.call(test, previousResponse),
                                     resSpec: resSpec 
                                   },
                                   previousResponse, cb)
    }

    if (!reqSpec.method) {
      return cb(new Error("Request spec must provide a method."))
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
          return cb(err, null)
        }

        try {
          if (typeof(resSpec) === 'function') {
            assert.ok(resSpec.call(test, response), "Assertion failed for test: " + EJSON.stringify(test))
          }

          _.forEach(resSpec, function(valueSpec, fieldName) {
            var value = response[fieldName]
            if (typeof(valueSpec) === 'function') {
              assert.ok(valueSpec.call(test, value),
                        "Assertion failed for field '" 
                        + fieldName + " with value '" + value, EJSON.stringify(test))
            } else {
              assert.deepEqual(valueSpec, value, EJSON.stringify(test) + " Response body: " + 
                                     JSON.stringify(response.body))
            }
          })
        } catch (e) {
          return cb(e)
        }
        
        return cb(null, response)
      }])
  },
})
