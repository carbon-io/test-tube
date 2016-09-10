var o = require('atom').o(module)
var oo = require('atom').oo(module)
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
    var self = this

    var result = []
    var previousResponse = undefined // This is a nice use of a closure. See what we are doing here?
    _.forEach(self.tests, function(test) {
      if (!(test instanceof Test)) {
        test = o({
          _type: Test,
          name: `${test.reqSpec.method} ${test.reqSpec.url}`,
          reqSpec: test.reqSpec,
          resSpec: test.resSpec,
          doTest: function() {
            previousResponse = self.sync._executeHttpTest(test, previousResponse)
          }
        })
      }
      result.push(test)
    })

    self.tests = result
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

    var endpoint = _o(url)
    if (typeof(test) === 'function') {
      return endpoint._performOperation(reqSpec.method.toLowerCase(), [
        reqSpec.body, 
        { 
          params: reqSpec.parameters,
          headers: reqSpec.headers,
          json: reqSpec.json,
          strictSSL: reqSpec.strictSSL
        }, 
        function(err, response) {  
          if (err) {
            return cb(err, null)
          }
          assert(test(response))
        }
      ])
    }
    
    if (typeof(reqSpec) === 'function') {
      return this._executeHttpTest({ reqSpec: reqSpec(previousResponse), 
                                     resSpec: resSpec 
                                   },
                                   previousResponse, cb)
    }


    if (!reqSpec.method) {
      return cb(new Error("Request spec must provide a method."))
    }

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
            assert.ok(resSpec(response), "Assertion failed for test: " + EJSON.stringify(test))
          }

          _.forEach(resSpec, function(valueSpec, fieldName) {
            var value = response[fieldName]
            if (typeof(valueSpec) === 'function') {
              assert.ok(valueSpec(value), 
                        "Assertion failed for field '" 
                        + fieldName + " with value '" + value, EJSON.stringify(test))
            } else {
              assert.deepStrictEqual(valueSpec, value, EJSON.stringify(test) + " Response body: " + 
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
