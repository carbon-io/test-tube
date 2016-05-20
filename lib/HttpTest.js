var o = require('atom').o(module)
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('fiber').__
var _ = require('lodash')
var assert = require('assert')
var EJSON = require('mongodb-extended-json')

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
    this.tests = []
  },

  /**********************************************************************
   * doTest
   */
  doTest: function() {
    var self = this
    if (this.tests) {
      self.tests.forEach(function(test) {        
        self.sync._executeHttpTest(test, undefined)
      })
    }
  },

  /**********************************************************************
   * _executeHttpTest
   */
  _executeHttpTest(test, previousResponse, cb) {
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
      return this._executeHttpTest(reqSpec(previousResponse), previousResponse, cb)
    }

    if (!reqSpec.url) {
      throw new Error("Request spec must provide a url.")
    }

    if (!reqSpec.method) {
      throw new Error("Request spec must provide a method.")
    }

    var endpoint = _o(reqSpec.url)
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
        if (err) {
          cb(err, null)
          return
        }
        _.forEach(resSpec, function(valueSpec, fieldName) {
          var value = response[fieldName]
          if (typeof(valueSpec) === 'function') {
            assert.equal(valueSpec(value), true, 
                         "Assertion failed for field '" 
                         + fieldName + " with value '" + value, EJSON.stringify(test))
          } else {
            assert.deepStrictEqual(valueSpec, value, EJSON.stringify(test) + " Response: " + 
                                   JSON.stringify(response))
          }
        })
        
        cb(null, response)
      }])
  },
})
