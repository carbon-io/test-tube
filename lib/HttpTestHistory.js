var _ = require('lodash')

var oo = require('@carbon-io/atom').oo(module)

/******************************************************************************
 * @class HttpTestHistory
 */
var HttpTestHistory = oo({
  /**********************************************************************
   * _C
   */
  _C: function() {
    this._requestSpecs = []
    this._responseSpecs = []
    this._requests = []
    this._responses = []
  },

  /**********************************************************************
   * addReqSpec
   */
  addReqSpec: function(name, reqSpec) {
    this._requestSpecs.push({
      reqSpec: reqSpec,
      name: name
    })
  },
  
  /**********************************************************************
   * addResSpec
   */
  addResSpec: function(name, resSpec) {
    this._responseSpecs.push({
      resSpec: resSpec,
      name: name
    })
  },

  /**********************************************************************
   * addReq
   */
  addReq: function(name, req) {
    this._requests.push({
      req: req,
      name: name
    })
  },

  /**********************************************************************
   * addRes
   */
  addRes: function(name, res) {
    this._responses.push({
      res: res,
      name: name
    })
  },

  /**********************************************************************
   * length
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

  /**********************************************************************
   * _get
   */
  _get: function(index, target) {
    var targetElem = undefined
    var length = this.length
    // XXX: avoid the current reqSpec when calling `get(-1)`
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
   * getReqSpec
   */
  getReqSpec: function(index) {
    return this._get(index, this._requestSpecs)
  },

  /**********************************************************************
   * getResSpec
   */
  getResSpec: function(index) {
    return this._get(index, this._responseSpecs)
  },

  /**********************************************************************
   * getReq
   */
  getReq: function(index) {
    return this._get(index, this._requests)
  },

  /**********************************************************************
   * getRes
   */
  getRes: function(index) {
    return this._get(index, this._responses)
  },

  /**********************************************************************
   * get 
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
