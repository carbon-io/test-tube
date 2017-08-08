var _ = require('lodash')

var oo = require('@carbon-io/atom').oo(module)

/***************************************************************************************************
 * @class HttpTestHistory
 */
var HttpTestHistory = oo({
  /*****************************************************************************
   * @constructs HttpTestHistory
   * @description HttpTestHistory
   * @memberof test-tube
   */
  _C: function() {
    /***************************************************************************
     * @property {xxx} _requestSpecs -- xxx
     */
    this._requestSpecs = []

    /***************************************************************************
     * @property {xxx} _responseSpecs -- xxx
     */
    this._responseSpecs = []

    /***************************************************************************
     * @property {xxx} _requests -- xxx 
     */
    this._requests = []

    /***************************************************************************
     * @property {xxx} _responses -- xxx
     */
    this._responses = []
  },

  /*****************************************************************************
   * @method addReqSpec
   * @description addReqSpec
   * @param {xxx} name -- xxx
   * @param {xxx} reqSpec -- xxx
   * @returns {undefined} -- undefined
   */
  addReqSpec: function(name, reqSpec) {
    this._requestSpecs.push({
      reqSpec: reqSpec,
      name: name
    })
  },
  
  /*****************************************************************************
   * @method addResSpec
   * @description addResSpec description
   * @param {xxx} name -- xxx
   * @param {xxx} resSpec -- xxx
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
   * @description addReq description
   * @param {xxx} name -- xxx
   * @param {xxx} req -- xxx
   * @returns {undefined} -- undefined
   */
  addReq: function(name, req) {
    this._requests.push({
      req: req,
      name: name
    })
  },

  /*****************************************************************************
   * @method addRes
   * @description addRes description
   * @param {xxx} name -- xxx
   * @param {xxx} res -- xxx
   * @returns {undefined} -- undefined
   */
  addRes: function(name, res) {
    this._responses.push({
      res: res,
      name: name
    })
  },

  /*****************************************************************************
   * @property {xxx} length -- xxx
   */
  length: {
    $property: {
      get: function() {
        return _.min([this._requestSpecs.length, 
                      this._responseSpecs.length,
                      this._requests.length,
                      this._responses.length])
      }
    }
  },

  /*****************************************************************************
   * @method _get
   * @description _get description
   * @param {xxx} index -- xxx
   * @param {xxx} target -- xxx
   * @throws {RangeError} -- xxx
   * @returns {xxx} -- xxx
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
   * @description getReqSpec description
   * @param {xxx} index -- xxx
   * @returns {xxx} -- xxx
   */
  getReqSpec: function(index) {
    return this._get(index, this._requestSpecs)
  },

  /*****************************************************************************
   * @method getResSpec
   * @description getResSpec description
   * @param {xxx} index -- xxx
   * @returns {xxx} -- xxx
   */
  getResSpec: function(index) {
    return this._get(index, this._responseSpecs)
  },

  /*****************************************************************************
   * @method getReq
   * @description getReq description
   * @param {xxx} index -- xxx
   * @returns {xxx} -- xxx
   */
  getReq: function(index) {
    return this._get(index, this._requests)
  },

  /*****************************************************************************
   * @method getRes
   * @description getRes description
   * @param {xxx} index -- xxx
   * @returns {xxx} -- xxx
   */
  getRes: function(index) {
    return this._get(index, this._responses)
  },

  /*****************************************************************************
   * @method get
   * @description get description
   * @param {xxx} index -- xxx
   * @returns {xxx} -- xxx
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
