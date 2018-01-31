var _ = require('lodash')

var oo = require('@carbon-io/atom').oo(module)

/***************************************************************************************************
 * @class HttpTestHistory
 */
var HttpTestHistory = oo({
  _ctorName: 'HttpTestHistory',

  /*****************************************************************************
   * @constructs HttpTestHistory
   * @description A class to manage the history of HTTP requests, responses,
   *              request specs, and response specs. This is useful during the
   *              execution of an {@link test-tube.HttpTest} if you want to
   *              replay requests or validate that the response matches a
   *              previous response. Note, this is accessible during test execution
   *              using {@link test-tube.TestContext.httpHistory}.
   * @memberof test-tube
   */
  _C: function() {
    /***************************************************************************
     * @property {typedef:test-tube.HttpTest.ReqSpec[]} _requestSpecs
     * @description The request spec history
     */
    this._requestSpecs = []

    /***************************************************************************
     * @property {typedef:test-tube.HttpTest.ResSpec} _responseSpecs
     * @description The response spec history
     */
    this._responseSpecs = []

    /***************************************************************************
     * @property {carbond.Request[]} _requests
     * @description The request history
     */
    this._requests = []

    /***************************************************************************
     * @property {carbond.Response[]} _responses
     * @description The response history
     */
    this._responses = []
  },

  /*****************************************************************************
   * @method addReqSpec
   * @description Add a request spec to the history
   * @param {string} name -- A name to reference the request spec by (pulled
   *                         from the test name)
   * @param {typedef:test-tube.HttpTest.ReqSpec} reqSpec -- A request spec
   * @returns {undefined}
   */
  addReqSpec: function(name, reqSpec) {
    this._requestSpecs.push({
      reqSpec: reqSpec,
      name: name
    })
  },

  /*****************************************************************************
   * @method addResSpec
   * @description Add a response spec to the history
   * @param {string} name -- A name to reference the response spec by (pulled
   *                         from the test name)
   * @param {typedef:test-tube.HttpTest.ResSpec} resSpec -- A response spec
   * @returns {undefined} -- undefined
   */
  addResSpec: function(name, resSpec) {
    this._responseSpecs.push({
      resSpec: resSpec,
      name: name
    })
  },

  /*****************************************************************************
   * @method addReq
   * @description Add a request
   * @param {string} name -- A name to reference the request spec by (pulled
   *                         from the test name)
   * @param {carbond.Request} req -- A request
   * @returns {undefined}
   */
  addReq: function(name, req) {
    this._requests.push({
      req: req,
      name: name
    })
  },

  /*****************************************************************************
   * @method addRes
   * @description Add a response
   * @param {string} name -- A name to reference the response spec by (pulled
   *                         from the test name)
   * @param {carbond.Request} res -- A response
   * @returns {undefined}
   */
  addRes: function(name, res) {
    this._responses.push({
      res: res,
      name: name
    })
  },

  /*****************************************************************************
   * @property {number} length -- The current number of elements in the history
   */
  length: {
    $property: {
      get: function() {
        try {
          return _.min([this._requestSpecs.length,
                        this._responseSpecs.length,
                        this._requests.length,
                        this._responses.length])
        } catch (e) {
          if (e instanceof TypeError) {
            return 0
          }
          throw e
        }
      }
    }
  },

  /*****************************************************************************
   * @method _get
   * @description _get description
   * @param {number|string} index -- The index/name of the element to retrieve.
   *                                 If this is a number, it can be negative.
   * @param {Object[]} target -- The history object for request specs, response
   *                             specs, requests, or responses
   * @throws {RangeError}
   * @returns {Object}
   */
  _get: function(index, target) {
    var targetElem = undefined
    var length = this.length
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

  /*****************************************************************************
   * @method getReqSpec
   * @description Get a request spec
   * @param {number|string} index -- The index or name of the request spec to
   *                                 retrieve. If this is a number, it can be
   *                                 negative.
   * @returns {typedef:test-tube.HttpTest.ReqSpec}
   */
  getReqSpec: function(index) {
    return this._get(index, this._requestSpecs)
  },

  /*****************************************************************************
   * @method getResSpec
   * @description Get a response spec
   * @param {number|string} index -- The index or name of the response spec to
   *                                 retrieve. If this is a number, it can be
   *                                 negative.
   * @returns {typedef:test-tube.HttpTest.ResSpec}
   */
  getResSpec: function(index) {
    return this._get(index, this._responseSpecs)
  },

  /*****************************************************************************
   * @method getReq
   * @description Get a request
   * @param {number|string} index -- The index or name of the request to
   *                                 retrieve. If this is a number, it can be
   *                                 negative.
   * @returns {carbond.Request}
   */
  getReq: function(index) {
    return this._get(index, this._requests)
  },

  /*****************************************************************************
   * @method getRes
   * @description Get a response
   * @param {number|string} index -- The index or name of the response to
   *                                 retrieve. If this is a number, it can be
   *                                 negative.
   * @returns {carbond.Response}
   */
  getRes: function(index) {
    return this._get(index, this._responses)
  },

  /*****************************************************************************
   * @method get
   * @description Get a request spec, response spec, request, and response
   * @param {number|string} index -- The index or name of the history element to
   *                                 retrieve. If this is a number, it can be
   *                                 negative.
   * @returns {Object} -- Keys are "reqSpec", "resSpec", "req", and "res"
   */
  get: function(index) {
    return {
      reqSpec: this._get(index, this._requestSpecs),
      resSpec: this._get(index, this._responseSpecs),
      req: this._get(index, this._requests),
      res: this._get(index, this._responses)
    }
  }
})

module.exports = HttpTestHistory
