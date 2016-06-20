var o = require('atom').o(module)
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('fiber').__
var _ = require('lodash')
var assert = require('assert')
var EJSON = require('mongodb-extended-json')
var HttpError = require('http-errors').HttpError

/******************************************************************************
 * @class HttpTest
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
    this.baseUrl = undefined
    this.tests = []
  },

  /**********************************************************************
   * doTest
   */
  doTest: function() {
    var self = this
    var previousResponse = undefined

    if (this.tests) {
      self.tests.forEach(function(test) {        
        previousResponse = self.sync._executeHttpTest(test, previousResponse)
      })
    }
  },

  /**********************************************************************
   * _executeHttpTest
   */
  _executeHttpTest: function(test, previousResponse, cb) {
    if (typeof(test) === 'function') {
      endpoint._performOperation(reqSpec.method.toLowerCase(), [
        reqSpec.body, 
        { 
          params: reqSpec.parameters,
          headers: reqSpec.headers,
          json: reqSpec.json,
          strictSSL: reqSpec.strictSSL
        }, 
        function(err, response) {  
          if (err) {
            cb(err, null)
            return
          }
          assert(test(response))
        }
      ])
      return 
    }

    var reqSpec = test.reqSpec
    var resSpec = test.resSpec
    
    if (typeof(reqSpec) === 'function') {
      return this._executeHttpTest({ reqSpec: reqSpec(previousResponse), 
                                     resSpec: resSpec 
                                   },
                                   previousResponse, cb)
    }

    var url = undefined
    if (!reqSpec.url) {
      if (!this.baseUrl) {
        throw new Error("Request spec must provide a url.")
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
      throw new Error("Request spec must provide a method.")
    }

    var endpoint = _o(url)
    // XXX want better method to invoke here. This is private and hacky
    endpoint._performOperation(reqSpec.method.toLowerCase(), [
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
            assert.deepStrictEqual(valueSpec, value, EJSON.stringify(test) + " Response: " + 
                                   JSON.stringify(response))
          }
        })
        
        return cb(null, response)
      }])
  },
})
