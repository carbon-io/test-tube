var util = require('util')

function SkipTestError(message) {
  Error.captureStackTrace && Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message || ''
}

util.inherits(SkipTestError, Error)

module.exports = {
  SkipTestError: SkipTestError
}
