var fs = require('fs')

var _ = require('lodash')

var ejson = require('@carbon-io/ejson')
var leafnode = require('@carbon-io/leafnode')
var oo = require('@carbon-io/atom').oo(module)
var _o = require('@carbon-io/bond')._o(module)

var SkipTestError = require('./errors').SkipTestError
var NotImplementedError = require('./errors').NotImplementedError
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
  _ctorName: 'SkipTest',
  _C: function() {
    this.name = 'SkipTest'
    this.description = 'skip test'
  },
  doTest: function() {
    throw new SkipTestError(this.description)
  }
})

/**
 * Simple wrapper for NotImplementedError.
 *
 */
var NotImplementedTest = oo({
  _type: Test,
  _ctorName: 'NotImplementedTest',
  _C: function() {
    this.name = 'NotImplementedTest'
    this.description = 'Not implemented'
  },
  doTest: function() {
    throw new NotImplementedError(this.description)
  }
})

function _connectDB(dbUri) {
  return leafnode.connect(dbUri)
}

function _getMongoUri(dbUri, fixture) {
  return dbUri || fixture.dbUri || _o('env:CARBONIO_TEST_DB_URI') || "mongodb://localhost:27017/mydb"
}

function _setupMongoDB(fixturePath, dbUri) {
  var fixture = ejson.parse(fs.readFileSync(fixturePath))
  var dbUri = _getMongoUri(dbUri, fixture)
  if (_.isNil(dbUri)) {
    throw new Error('dbUri is required')
  }
  if (_.isNil(fixture.data)) {
    throw new Error('data is required')
  }
  var db = _connectDB(dbUri)
  db._nativeDB.sync.dropDatabase()
  for (var colName in fixture.data) {
    var col = db.getCollection(colName)
    fixture.data[colName].forEach(function(datum) {
      col.insert(datum)
    })
  }
  return db
}

function _teardownMongoDB(fixturePath, dbUri) {
  var fixture = ejson.parse(fs.readFileSync(fixturePath))
  var dbUri = _getMongoUri(dbUri, fixture)
  if (_.isNil(dbUri)) {
    throw new Error('dbUri is required')
  }
  var db = _connectDB(dbUri)
  db._nativeDB.sync.dropDatabase()
  db.close()
}

module.exports = {
  SkipTest: SkipTest,
  NotImplementedTest: NotImplementedTest,
  _connectDB: _connectDB,
  _setupMongoDB: _setupMongoDB,
  _teardownMongoDB: _teardownMongoDB
}
