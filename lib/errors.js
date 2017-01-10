var util = require('util')

function SkipTestError(message) {
  Error.captureStackTrace && Error.captureStackTrace(this, SkipTestError)
  this.name = this.constructor.name
  this.message = message || ''
}

util.inherits(SkipTestError, Error)

module.exports = {
  SkipTestError: SkipTestError
}
