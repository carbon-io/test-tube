var _ = require('lodash')

var oo = require('@carbon-io/atom').oo(module)

/***************************************************************************************************
 * @class TestContext
 */
var TestContext = oo({
  /*****************************************************************************
   * @constructs TestContext
   * @description TestContext description
   * @memberof test-tube
   */
  _C: function() {
    /***************************************************************************
     * @property {xxx} __testtube -- xxx
     */
    this.__testtube = undefined
  },

  /*****************************************************************************
   * @method _init
   * @description _init description
   * @returns {undefined} -- undefined
   */
  _init: function() {
    this.__testtube = {
      options: {}, // XXX: this should be more rigorously defined
      global: {},
      local: undefined,
      localStateStack: [],
      httpHistory: undefined,
      path: '/'
    }
  },
  /*****************************************************************************
   * @property {xxx} global -- xxx
   */
  global: {
    $property: {
      get: function() {
        return this.__testtube.global
      },
      set: function(state) {
        this.__testtube.state = global
      }
    }
  },

  /*****************************************************************************
   * @property {xxx} local -- xxx
   */
  local: {
    $property: {
      get: function() {
        return this.__testtube.local
      },
      set: function(local) {
        this.__testtube.local = local
      }
    }
  },

  /*****************************************************************************
   * @property {xxx} httpHistory -- xxx
   */
  httpHistory: {
    $property: {
      get: function() {
        return this.__testtube.httpHistory
      },
      set: function(httpHistory) {
        this.__testtube.httpHistory = httpHistory
      }
    }
  },

  /*****************************************************************************
   * @property {xxx} _tt -- xxx
   */
  _tt: {
    $property: {
      get: function() {
        return this.__testtube
      }
    }
  },

  /*****************************************************************************
   * @method stash
   * @description stash description
   * @param {xxx} state -- xxx
   * @returns {xxx} -- xxx
   */
  stash: function(state) {
    if (!_.isUndefined(this.local)) {
      this.__testtube.localStateStack.push(this.local)
    }
    return this.local = state ? state : {}
  },

  /*****************************************************************************
   * @method restore
   * @description restore description
   * @returns {xxx} -- xxx
   */
  restore: function() {
    return this.local = this.__testtube.localStateStack.pop()
  }
})

module.exports = TestContext
