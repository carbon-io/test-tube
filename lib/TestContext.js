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
    this._httpHistory = undefined
    this._httpHistories = {
      stack: []
    }
  },

  /**********************************************************************
   * _init
   */
  _init: function() {
  },

  /**********************************************************************
   * @member history
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
   * @method stashHttpHistory
   */
  stashHttpHistory: function(newHistory) {
    if (!_.isUndefined(this.httpHistory)) {
      this._httpHistories.stack.push(this.httpHistory)
    }
    return this.httpHistory = newHistory
  },
  
  /**********************************************************************
   * @method restoreHttpHistory
   */
  restoreHttpHistory: function() {
    return this.httpHistory = this._httpHistories.stack.pop()
  }
})

module.exports = TestContext
