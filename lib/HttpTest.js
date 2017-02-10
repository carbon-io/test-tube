var o = require('@carbon-io/atom').o(module)
var oo = require('@carbon-io/atom').oo(module)
var _o = require('@carbon-io/bond')._o(module)
var __ = require('@carbon-io/fibers').__(module)
var _ = require('lodash')
var assert = require('assert')
var EJSON = require('@carbon-io/ejson')
var HttpError = require('@carbon-io/http-errors').HttpError
var Test = require('../lib/Test')


/******************************************************************************
 * @class HttpTestHistory
 */
var HttpTestHistory = oo({
  _C: function() {
    this._requestSpecs = []
    this._responseSpecs = []
    this._responses = []
  },

  _addReqSpec: function(name, reqSpec) {
    this._requestSpecs.push({
      reqSpec: reqSpec,
      name: name
    })
  },
  
  _addResSpec: function(name, resSpec) {
    this._responseSpecs.push({
      res: resSpec,
      name: name
    })
  },

  _addRes: function(name, res) {
    this._responses.push({
      res: res,
      name: name
    })
  },

  _get: function(index, target) {
    var targetElem = undefined
    // XXX: avoid the current reqSpec when calling `get(-1)`
    var length = _.min([this._requestSpecs.length, 
                        this._responseSpecs.length,
                        this._responses.length])
    var unpack = function(packed) {
      return _.reject(packed, function(_, k) { 
        return k === 'name' 
      }).pop()
    }
    if (_.isInteger(index)) {
      if (index < 0) {
        if ((index += length) < 0) {
          throw new RangeError('req/res history negative index ran off the ' +
                               'head: ' + (index - length))
        }
      } else if (index >= length) {
        throw new RangeError('req/res history index ran off the tail: ' + 
                             (index))
      }
      return unpack(target[index])
    } else if (_.isString(index)) {
      targetElem = _.filter(target, ['name', index])
      if (targetElem.length === 0) {
        throw new RangeError('No req/res matched by name: ' + index)
      } else if (targetElem.length > 1) {
        throw new RangeError('More than one req/res matched by name: ' + index)
      }
      return unpack(targetElem.pop())
    }
    throw new TypeError(index)
  },

  /**********************************************************************
   * 
   */
  getReqSpec: function(index) {
    return this._get(index, this._requestSpecs)
  },

  /**********************************************************************
   * 
   */
  getResSpec: function(index) {
    return this._get(index, this._responseSpecs)
  },

  /**********************************************************************
   * 
   */
  getRes: function(index) {
    return this._get(index, this._responses)
  },

  /**********************************************************************
   * 
   */
  get: function(index) {
    return {
      reqSpec: this._get(index, this._requestSpecs),
      resSpec: this._get(index, this._responseSpecs),
      res: this._get(index, this._responses)
    }
  }
})

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
    var history = new HttpTestHistory()
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
          reqSpec: test.reqSpec,
          resSpec: test.resSpec,
          doTest: function() {
            history._addRes(test.name, self.sync._executeHttpTest(test, history))
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
      return this._executeHttpTest(
        { 
          name: test.name || `${reqSpec.method} ${reqSpec.url}`,
          reqSpec: reqSpec.call(test, history), 
          resSpec: resSpec 
        },
        history, 
        cb)
    }

    if (!reqSpec.method) {
      return cb(new Error("Request spec must provide a method."))
    }

    history._addResSpec(test.name, resSpec)
    history._addReqSpec(test.name, _.merge(_.cloneDeep(reqSpec), {url: url}))
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
          return cb(e)
        }
        
        return cb(null, response)
      }])
  },
})
