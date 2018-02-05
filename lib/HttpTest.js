var assert = require('assert')

var _ = require('lodash')
var colour = require('colour')

var EJSON = require('@carbon-io/ejson')
var HttpError = require('@carbon-io/http-errors').HttpError
var __ = require('@carbon-io/fibers').__(module)
var _o = require('@carbon-io/bond')._o(module)
var o = require('@carbon-io/atom').o(module)
var oo = require('@carbon-io/atom').oo(module)

var Test = require('./Test')
var HttpTestHistory = require('./HttpTestHistory')

/***************************************************************************************************
 * @class HttpTest
 */
module.exports = oo({

  /*****************************************************************************
   * _type
   */
  _type: Test,
  _ctorName: 'HttpTest',

  /*****************************************************************************
   * @constructs HttpTest
   * @description An extension of {@link test-tube.Test} that simplifies testing
   *              of HTTP based web services. In general, this will be used as
   *              a test-suite, as it parses the sub-tests to build test objects
   *              that make HTTP requests and validate HTTP responses using a
   *              simple specification format. Services that are being tested
   *              can be started in a parent test or using {@link
   *              test-tube.HttpTest.setup}. Similarly, services can be stopped
   *              in a parent test or using {@link test-tube.HttpTest.teardown}.
   * @memberof test-tube
   * @extends test-tube.Test
   */
  _C: function() {
    /****************************************************************************
     * @property {string} baseUrl
     * @description The base URL for all tests in the test-suite. This will be
     *              prepended to any URL specified in the suite.
     */
    this.baseUrl = undefined
  },

  /*****************************************************************************
   * @method _init
   * @description Initialize the test object
   * @returns {undefined}
   */
  _init: function() {
    Test.prototype._init.call(this)
  },

  /*****************************************************************************
   * @method _prerun
   * @description Creates a new {@link test-tube.HttpHistory} object for this
   *              test-suite and stashes any previous history object that may
   *              be present in order to restore it when this suite finishes
   *              execution.
   * @param {test-tube.TestContext} context -- A context object
   * @returns {undefined}
   */
  _prerun: function(context) {
    Test.prototype._prerun.call(this, context)
    context.local.__previousHttpHistory = context.httpHistory
    context.httpHistory = new HttpTestHistory()
  },

  /*****************************************************************************
   * @method _postrun
   * @description Restores the previous {@link test-tube.HttpHistory} object
   *              if one existed
   * @param {test-tube.TestContext} context -- A context object
   * @returns {undefined}
   */
  _postrun: function(context) {
    context.httpHistory = context.local.__previousHttpHistory
    Test.prototype._postrun.call(this, context)
  },

  /*****************************************************************************
   * @method _initTest
   * @description Builds an instance of {@link test-tube.Test} from a {@link
   *              typedef:test-tube.HttpTest.TestSpec}
   * @param {typedef:test-tube.HttpTest.TestSpec|test-tube.Test} test
   * @description The test spec (note, if this is already an instance of {@link
   *              test-tube.Test}, it will simply be returned)
   * @returns {test-tube.Test}
   */
  _initTest: function(test) {
    var self = this

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
        description: test.description,
        errorExpected: test.errorExpected,
        reqSpec: test.reqSpec,
        resSpec: test.resSpec,
        doTest: function(context) {
          try {
            var response = self.sync._executeHttpTest(test, context)
          } finally {
            context.httpHistory.addReq(test.name, response ? response.req : undefined)
            context.httpHistory.addRes(test.name, response)
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
    return Test.prototype._initTest.call(this, test)
  },

  /*****************************************************************************
   * @method _initTests
   * @description Runs {@link test-tube.HttpTest._initTest} on each test in
   *              {@link test-tube.HttpTest.tests}. Note, this will replace any
   *              {@link typedef:test-tube.HttpTest.TestSpec} with an instance
   *              of {@link test-tube.Test} that implements the spec.
   * @returns {undefined}
   */
  _initTests: function() {
    var self = this

    if (this.tests) {
      var result = []
      _.forEach(this.tests, function(test) {
        result.push(self._initTest(test))
      })
      self.tests = result
    }
  },

  /*****************************************************************************
   * @typedef ReqSpec
   * @description A specification describing the request to be sent. If this is
   *              a function, it will be called during test execution and should
   *              return an ``Object`` with the documented properties.
   * @type {Object|Function}
   * @property {string} method -- The HTTP request method to use (e.g., "GET",
   *                              "POST", "PUT", etc.)
   * @property {string} url --  The URL that should be requested. Note, {@link
   *                            test-tube.HttpTest.baseUrl} will be prepended
   *                            to this value when making the request.
   * @property {Object} parameters -- The query string parameters to include in
   *                                  the request URL
   * @property {Object} headers -- The headers to include with the request
   * @property {Object|Array} body -- The body to include with the request
   * @property {Object} options -- Options that should be passed directly to
   *                               the underlying "requests" module
   */

  // XXX document "json" and "strictSSL"
  /*****************************************************************************
   * @typedef ResSpec
   * @description A specification used to validate an HTTP response. If this is
   *              a function, it will be called during test execution and should
   *              return an ``Object`` with the documented properties. If any
   *              property of the spec is itself a function, it will be called
   *              with the value of the incoming response as the first argument
   *              and the {@link test-tube.TestContext} object as the second
   *              argument (e.g., ``{statusCode: function(statusCode, context) {...}``)
   *              and should throw an assertion error if something that is
   *              received is not expected.
   * @type {Object|Function}
   * @property {number|Function} statusCode -- The HTTP status code of the
   * @property {Object|Function} headers -- The response headers
   * @property {Object|Array|Function} body -- The response body
   */

  /*****************************************************************************
   * @typedef TestSpec
   * @description The specification for an {@link test-tube.HttpTest} sub-test
   * @type {Object}
   * @property {string} name -- Used to name the test (note, a name will be
   *                            generated using the method and URL if this is
   *                            omitted)
   * @property {string} description -- See {@link test-tube.Test.description}
   * @property {Function} setup -- See {@link test-tube.Test.setup}
   * @property {Function} teardown -- See {@link test-tube.Test.teardown}
   * @property {typedef:test-tube.HttpTest.ReqSpec} reqSpec -- A specification of
   *                                                           the request to be
   *                                                           sent
   * @property {typedef:test-tube.HttpTest.ResSpec} resSpec -- A specification of
   *                                                           the response
   *                                                           expected
   */

  /*****************************************************************************
   * @method _executeHttpTest
   * @description Runs a test in the test-suite
   * @param {test-tube.Test} test -- A test in the test-suite
   * @param {test-tube.TestContext} context -- A context object
   * @param {Function} cb -- An errback
   * @returns {undefined}
   */
  _executeHttpTest: function(test, context, cb) {
    var url = undefined
    var options = test.reqSpec.options || {}
    var reqSpec = test.reqSpec
    var resSpec = test.resSpec

    var _cb = function() {
      context.httpHistory.addResSpec(test.name, resSpec)
      context.httpHistory.addReqSpec(
        test.name, _.merge(_.cloneDeep(reqSpec), {url: url}))
      return cb.apply(null, arguments)
    }

    if (typeof(reqSpec) === 'function') {
      return this._executeHttpTest(
        this._initTest({
          name: test.name || `${reqSpec.method} ${reqSpec.url}`,
          reqSpec: reqSpec.call(test, context),
          resSpec: resSpec
        }),
        context,
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
            resSpec.call(test, response, context)
          } else {
            _.forEach(resSpec, function(valueSpec, fieldName) {
              var value = response[fieldName]
              if (typeof(valueSpec) === 'function') {
                if (valueSpec.toString().match(/\s+return\s+/)) {
                  console.warn(('WARNING: If resSpec.valueSpec is a function, throw ' +
                                'an error to indicate failure rather than ' +
                                'returning true to indicate success').yellow)
                }
                try {
                  valueSpec.call(test, value, context)
                } catch (e) {
                  e.message = "Assertion failed for field '" + fieldName +
                              "' with value '" + value + "': " + e.message
                  throw e
                }
              } else {
                assert.deepEqual(valueSpec, value, EJSON.stringify(test) +
                                                   " Response body: " +
                                                   JSON.stringify(response.body) +
                                                   " Response statusCode: " +
                                                   response.statusCode)
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
