var util = require('util')

function SkipTestError(message) {
  Error.captureStackTrace && Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message || ''
}

util.inherits(SkipTestError, Error)

// XXX: might want to add some env var configuration around this error in Test.js
//      so that on master/travis this will fail the test suite, but on other 
//      branches/locally the test suite can be allowed to pass
function NotImplementedError(message) {
  SkipTestError.call(this, message)
  this.name = this.constructor.name
  this.message = message || 'Not implemented'
}

util.inherits(NotImplementedError, SkipTestError)

module.exports = {
  SkipTestError: SkipTestError,
  NotImplementedError: NotImplementedError
}

