var _ = require('lodash')

var oo = require('@carbon-io/atom').oo(module)

/******************************************************************************
 * @class TestContext
 */
var TestContext = oo({
  /**********************************************************************
   * _C
   */
  _C: function() {
    this.__testtube = undefined
  },

  /**********************************************************************
   * _init
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

  /**********************************************************************
   * @member state
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

  /**********************************************************************
   * @member local
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

  /**********************************************************************
   * @member httpHistory
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

  /**********************************************************************
   * @member httpHistory
   * @protected
   */
  _tt: {
    $property: {
      get: function() {
        return this.__testtube
      }
    }
  },

  /**********************************************************************
   * @method stash
   */
  stash: function(state) {
    if (!_.isUndefined(this.local)) {
      this.__testtube.localStateStack.push(this.local)
    }
    return this.local = state ? state : {}
  },

  /**********************************************************************
   * @method restore
   */
  restore: function() {
    return this.local = this.__testtube.localStateStack.pop()
  }
})

module.exports = TestContext
