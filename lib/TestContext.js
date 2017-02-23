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
      state: undefined,
      states: [],
      httpHistory: undefined
    }
  },

  /**********************************************************************
   * @member state
   */
  state: {
    $property: {
      get: function() {
        return this.__testtube.state
      },
      set: function(state) {
        this.__testtube.state = state
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
   * @method stash
   */
  stash: function(state) {
    if (!_.isUndefined(this.state)) {
      this.__testtube.states.push(this.state)
    }
    return this.state = state ? state : {}
  },
  
  /**********************************************************************
   * @method restore
   */
  restore: function() {
    return this.state = this.__testtube.states.pop()
  }
})

module.exports = TestContext
