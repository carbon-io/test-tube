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
    this._state = undefined
    this._states = undefined
    this._httpHistory = undefined
  },

  /**********************************************************************
   * _init
   */
  _init: function() {
    this._states = []
  },

  /**********************************************************************
   * @member state
   */
  state: {
    $property: {
      get: function() {
        return this._state
      },
      set: function(state) {
        this._state = state
      }
    }
  },
  
  /**********************************************************************
   * @member httpHistory
   */
  httpHistory: {
    $property: {
      get: function() {
        return this._httpHistory
      },
      set: function(httpHistory) {
        this._httpHistory = httpHistory
      }
    }
  },
  
  /**********************************************************************
   * @method stash
   */
  stash: function(state) {
    if (!_.isUndefined(this.state)) {
      this._states.push(this.state)
    }
    return this.state = state ? state : {}
  },
  
  /**********************************************************************
   * @method restore
   */
  restore: function() {
    return this.state = this._states.pop()
  }
})

module.exports = TestContext
