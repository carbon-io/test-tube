var oo = require('@carbon-io/atom').oo(module)

var SkipTestError = require('./errors').SkipTestError
var Test = require('./Test')

/**
 * Simple wrapper for SkipTestError.
 *
 * @description This can be useful when testing across versions where certain 
 *              features are not available. ex:
 *              ```
 *              ...
 *              tests: [
 *                version === 6 ? _o('node6tests') : o({_type: SkipTest, description: 'requires node 6'})
 *              ]
 *              ...
 *              ```
 */
var SkipTest = oo({
  _type: Test,
  _C: function() {
    this.name = 'SkipTest'
    this.description = 'skip test'
  },
  doTest: function() {
    throw new SkipTestError(this.description)
  }
})

module.exports = {
  SkipTest: SkipTest
}
