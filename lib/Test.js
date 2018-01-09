var assert = require('assert')
var inspect = require('util').inspect
var path = require('path')
var ppath = path.posix

var _ = require('lodash')
var colour = require('colour')
var diff = require('deep-diff').diff
var minimatch = require('minimatch')

var __ = require('@carbon-io/fibers').__(module)
var _o = require('@carbon-io/bond')._o(module)
var o = require('@carbon-io/atom').o(module)
var oo = require('@carbon-io/atom').oo(module)

var SkipTestError = require('./errors').SkipTestError
var TestContext = require('./TestContext')

var AssertionError = assert.AssertionError

/***************************************************************************************************
 * @class Test
 */
var Test = oo({
  _ctorName: 'Test',

  /*****************************************************************************
   * @constructs Test
   * @description Test description
   * @memberof test-tube
   */
  _C: function() {
    /***************************************************************************
     * @property {string} name -- xxx
     */
    this.name = path.basename(module.filename, path.extname(module.filename)) // name of this file without ex

    /***************************************************************************
     * @property {xxx} tests -- xxx
     */
    this.tests = []

    /***************************************************************************
     * @property {xxx} testContextClass -- xxx
     */
    this.testContextClass = TestContext

    /***************************************************************************
     * @property {xxx} parent -- xxx
     */
    this.parent = undefined

    /***************************************************************************
     * @property {xxx} description -- xxx
     */
    this.description = undefined

    /***************************************************************************
     * @property {boolean} [errorExpected=false] -- xxx
     */
    this.errorExpected = false

    /***************************************************************************
     * @property {boolean} [selfBeforeChildren=false] -- xxx
     */
    this.selfBeforeChildren = false

    // XXX: _mongoFixtures and _dbs will likely be going away, don't use
    /***************************************************************************
     * @property {xxx} _mongoFixtures -- xxx
     */
    this._mongoFixtures = undefined

    /***************************************************************************
     * @property {xxx} _dbs -- xxx
     */
    this._dbs = {}
  },

  /*****************************************************************************
   * @method _init
   * @description _init description
   * @returns {undefined} -- undefined
   */
  _init: function() {
    this._initTests()
  },

  /*****************************************************************************
   * @method _initTest
   * @description _initTest description
   * @param {xxx} test -- xxx
   * @returns {xxx} -- xxx
   */
  _initTest: function(test) {
    test.parent = this
    return test
  },

  /*****************************************************************************
   * @method _initTests
   * @description _initTests description
   * @returns {undefined} -- undefined
   */
  _initTests: function() {
    var self = this
    if (this.tests) {
      this.tests.forEach(function(test) {
        self._initTest(test)
      })
    }
  },

  /*****************************************************************************
   * @method toJSON
   * @description toJSON description
   * @returns {xxx} -- xxx
   */
  toJSON: function() {
    return {
      name: this.name,
      tests: this.tests,
      description: this.description,
      errorExpected: this.errorExpected,
      selfBeforeChildren: this.selfBeforeChildren
    }
  },

  /*****************************************************************************
   * @method serialize
   * @description serialize Note: expected by https://github.com/mongodb-js/extended-json description
   * @returns {xxx} -- xxx
   */
  serialize: function() {
    return this.toJSON()
  },

  /*****************************************************************************
   * @property {xxx} cmdargs -- xxx
   */
  cmdargs: {
    run: {
      help: 'Run the test suite',
      command: true,
      default: true
    },
    path: {
      help: 'Process tests rooted at PATH (globs allowed)',
      list: true,
      metavar: 'PATH'
    },
    include: {
      help: 'Process tests matching GLOB (if --exclude is present, --include ' +
            'takes precedence, but will fall through if a test is not matched)',
      list: true,
      metavar: 'GLOB'
    },
    exclude: {
      help: 'Process tests not matching GLOB (if --include is present, ' +
            '--exclude will be skipped if the test is matched by the former)',
      list: true,
      metavar: 'GLOB'
    }
  },

  /*****************************************************************************
   * _main
   */
  _main: {
    run: function(options) {
      var self = this
      this._log(`Running ${this.name}...`.bold)
      this.run(undefined, function(err, result) {
        if (err) {
          console.log(err.stack)
        }
        self._log("")
        self.generateReport(result)
        if (!result.passed) {
          process.exit(1)
        }
      })
    },
  },

  /*****************************************************************************
   * @method setup
   * @description setup description
   * @param {xxx} context -- xxx
   * @param {xxx} done -- xxx
   * @returns {undefined} -- undefined
   */
  setup: function(context, done) {
    done()
  },

  /*****************************************************************************
   * @method teardown
   * @description teardown description
   * @param {xxx} context -- xxx
   * @param {xxx} done -- xxx
   * @returns {undefined} -- undefined
   */
  teardown: function(context, done) {
    done()
  },

  /*****************************************************************************
   * @method _errorExpected
   * @description _errorExpected description
   * @param {xxx} result -- xxx
   * @param {xxx} error -- xxx
   * @throws {xxx} -- xxx
   * @returns {xxx} -- xxx
   */
  _errorExpected: function(result, error) {
    result.passed = true
    result.error = error
    if (_.isBoolean(this.errorExpected)) {
      return result
    }
    // if we've got something other than a bool, than validate the error
    // using assert.throws
    try {
      assert.throws(function() {
        throw error
      }, this.errorExpected)
    } catch (e) {
      result.passed = false
    }
    return result
  },

  /*****************************************************************************
   * @method _initContext
   * @description _initContext description
   * @param {xxx} context -- xxx
   * @throws {TypeError} -- xxx
   * @returns {xxx} -- xxx
   */
  _initContext: function(context) {
    if (_.isUndefined(context)) {
      context = new this.testContextClass()
      if (!(context instanceof TestContext)) {
        throw new TypeError('testContextClass is not an instance of TestContext')
      }
      // XXX: revisit context._tt.options
      context._tt.options = this.parsedCmdargs || {}
    }
    context.stash()
    return context
  },

  /*****************************************************************************
   * @method _prerun
   * @description _prerun description
   * @param {xxx} context -- xxx
   * @returns {undefined} -- undefined
   */
  _prerun: function(context) {
    var name = this.name.indexOf('/') !== -1 ?
                  this.name.substring(0, this.name.indexOf('/')) : this.name
    context._tt.path = ppath.join(context._tt.path, name)
  },

  /*****************************************************************************
   * @method _postrun
   * @description _postrun description
   * @param {xxx} context -- xxx
   * @returns {undefined} -- undefined
   */
  _postrun: function(context) {
    context._tt.path = ppath.dirname(context._tt.path)
  },

  /*****************************************************************************
   * @method _checkName
   * @description _checkName description
   * @param {xxx} context -- xxx
   * @returns {xxx} -- xxx
   */
  _checkName: function(context) {
    var self = this
    var includes = context._tt.options.include
    var excludes = context._tt.options.exclude
    // have to get the path basename to avoid names with "/" in them
    var name = path.basename(context._tt.path)
    if (!_.isUndefined(includes)) {
      if (_.some(includes, function(glob) { return minimatch(name, glob) })) {
        // if we match an include rule, fail
        return false
      } else {
        // otherwise, if excludes is not present, succeed
        if (_.isUndefined(excludes)) {
          return true
        }
      }
    }
    if (!_.isUndefined(excludes)) {
      if (_.some(excludes, function(glob) { return minimatch(name, glob) })) {
        // if we match an exclude rule, succeed
        return true
      }
    }
    // fail
    return false
  },

  /*****************************************************************************
   * @method _checkPath
   * @description _checkPath description
   * @param {xxx} context -- xxx
   * @param {xxx} useDirname -- xxx
   * @returns {xxx} -- xxx
   */
  _checkPath: function(context, useDirname) {
    var globs = context._tt.options.path
    var _path = context._tt.path
    if (_.isUndefined(useDirname) ? false : useDirname) {
      _path = path.dirname(_path)
    }
    _path = path.join(_path, '/')
    if (!_.isUndefined(globs) &&
        globs.length >= 0 &&
        !_.some(globs, function(glob) { return minimatch(_path, glob) })) {
      return true
    }
    return false
  },

  // XXX: _(setup|teardown)Fixtures will likely be going away, don't use
  _setupFixtures: function() {
    var dbAlias = undefined
    if (!_.isNil(this._mongoFixtures)) {
      for (dbAlias in this._mongoFixtures) {
        if (_.isString(this._mongoFixtures[dbAlias])) {
          this._dbs[dbAlias] = util._setupMongoDB(this._mongoFixtures[dbAlias])
        } else {
          this._dbs[dbAlias] = util._setupMongoDB(
            this._mongoFixtures[dbAlias]['fixturePath'],
            this._mongoFixtures[dbAlias]['dbUri'])
        }
      }
    }
    for (dbAlias in this._dbs) {
      if (_.isString(this._dbs[dbAlias])) {
        this._dbs[dbAlias] = util._connectDB(this._dbs[dbAlias])
      }
    }
  },

  _teardownFixtures: function() {
    var dbAlias = undefined
    if (!_.isNil(this._mongoFixtures)) {
      for (dbAlias in this._mongoFixtures) {
        if (_.isString(this._mongoFixtures[dbAlias])) {
          util._teardownMongoDB(this._mongoFixtures[dbAlias])
        } else {
          util._teardownMongoDB(
            this._mongoFixtures[dbAlias]['fixturePath'],
            this._mongoFixtures[dbAlias]['dbUri'])
        }
      }
    }
    for (dbAlias in this._dbs) {
      try {
        this._dbs[dbAlias].close()
      } catch (e) {
        console.error(e.toString())
      }
    }
  },

  _buildTestResult: function(name, description) {
    return {
      name: name,
      description: description,
      passed: true,
      skipped: false,
      skippedTag: 'SKIPPED',
      filtered: false,
      report: false,
      error: undefined,
      self: undefined,
      time: 0,
      tests: undefined,
    }
  },

  /*****************************************************************************
   * @method run
   * @description run description
   * @param {xxx} context -- xxx
   * @param {xxx} done -- xxx
   * @returns {Object} -- result
   */
  run: function(context, done) {
    var self = this
    var filtered = false

    if (done) {
      return __(function() {
          // NOTE: all errors should be caught in the following try/catch block
          done(null, self.run(context))
      })
    }

    // initialize result
    var result = this._buildTestResult(this.name, this.description)

    context = this._initContext(context)
    this._prerun(context)

    try {
      try {
        // check the current path
        filtered = this._checkPath(context)
        if (filtered) {
          // if the current path is filtered, check if the parent path is filtered, and if not,
          // check the name of this test
          filtered = !this._checkPath(context, true) ? this._checkName(context) : true
        } else {
          // otherwise consult the include/exclude rules
          filtered = this._checkName(context)
        }
        // initialize result.filtered
        result.filtered = filtered
        result.report = !filtered

        if (!filtered) {
          // Setup
          if (self.setup.length > 1) { // cb expected
            self.sync.setup(context)
          } else {
            self.setup(context)
          }
          self._setupFixtures()
        }

        var selfTest = function() {
          if (self.doTest) {
            if (!filtered) {
              var selfResult = self._runSelf(context)
              result.self = selfResult
              result.time = result.time + selfResult.time
              result.skipped = selfResult.skipped
              result.skippedTag = selfResult.skippedTag
              result.error = selfResult.error
              result.passed = result.passed && selfResult.passed
            } else {
              result.self = self._buildSelfResult()
              result.self.passed = result.self.filtered = true
            }
          } else {
            result.report = result.report || !filtered
          }
        }

        // self
        if (self.selfBeforeChildren) {
          selfTest()
        }

        // children
        if (this.tests) {
          result.tests = []
          this.tests.forEach(function(test) {
            var childResult = undefined
            // pass the context
            try {
              childResult = test.sync.run(context)
            } catch (e) {
              if (e instanceof TypeError) {
                throw new TypeError(
                  (_.isNil(test.name) ? 'Test ' : 'Test <' + test.name + '> ') +
                  'does not appear to be an instance of testtube.Test. ' +
                  'You may be missing "o()", "_type", or "module.exports" ' +
                  'may not be set appropriately in a child module.')
              } else {
                throw e
              }
            }
            result.tests.push(childResult)
            result.time = result.time + childResult.time
            result.passed = result.passed && childResult.passed
            result.report = result.report || childResult.report
          })
        }


        // self
        if (!self.selfBeforeChildren) {
          selfTest()
        }

      } finally {
        if (!filtered) {
          self._teardownFixtures()
          // Teardown (allowed to throw assertion errors)
          if (self.teardown.length > 1) { // cb expected
            self.sync.teardown(context)
          } else {
            self.teardown(context)
          }
        }
      }
    } catch (e) {
      if (e instanceof SkipTestError) {
        result.passed = true
        result.skipped = true
        result.skippedTag = e.tag || result.skippedTag
        result.error = e
      } else if (self.errorExpected) {
        result = self._errorExpected(result, e)
      } else {
        result.passed = false // belt & suspenders
        result.error = e
      }
    } finally {
      // fail test if an error was expected, but none was encountered
      if (!result.filtered &&
          result.passed &&
          self.errorExpected &&
          !result.error) {
        result.passed = false
        result.error = new Error('Error expected')
      }
    }

    if (result.passed) {
      if (!result.skipped) {
        if (!result.filtered || result.report) {
          this._log("  [" + "*".green + "] " + this.name + " (" + result.time +
                    "ms)")
        }
      } else {
        this._log("  [" + "*".yellow + "] " + this.name + " " +
                  result.skippedTag + " (" + result.time + "ms)")
      }
    } else {
      this._log("  [" + "-".red + "] " + this.name + " (" + result.time +
                "ms) " + "FAILURE".red)
    }

    this._postrun(context)
    context.restore()

    return result
  },

  _buildSelfResult: function() {
    return {
      passed: false,
      skipped: false,
      skippedTag: 'SKIPPED',
      filtered: false,
      error: undefined,
      time: undefined
    }
  },

  /*****************************************************************************
   * @method _runSelf
   * @description _runSelf description
   * @param {xxx} context -- xxx
   * @returns {Object} -- result
   */
  _runSelf: function(context) {
    var self = this
    var result = this._buildSelfResult()

    try {
      // Start timer
      var startTime = (new Date()).getTime()

      // Call doTest
      if (self.doTest.length > 1) { // cb expected
        self.sync.doTest(context)
      } else { // no cb expected
        self.doTest(context)
      }

      result.passed = true
    } catch (e) {
      if (e instanceof SkipTestError) {
        result.passed = true
        result.skipped = true
        result.skippedTag = e.tag || result.skippedTag
        result.error = e
      } else if (self.errorExpected) {
        result = self._errorExpected(result, e)
      } else {
        result.passed = false // belt & suspenders
        result.error = e
      }
    } finally {
      // Stop timer
      var endTime = (new Date()).getTime()
      result.time = endTime - startTime
    }

    return result
  },

  /*****************************************************************************
   * @method _log
   * @description _log XXX: consider making this a class method?
   * @param {xxx} msg -- xxx
   * @param {xxx} level -- xxx
   * @returns {undefined} -- undefined
   */
  _log: function(msg, level) {
    level = level || 0
    var header = ""
    for (var i = 0; i < level; i++) {
      header += "  "
    }
    var lines = _.split(msg, '\n')
    for (i = 0; i < lines.length; i++) {
      console.log(header + lines[i])
    }
  },

  /*****************************************************************************
   * @method generateReport
   * @description generateReport description
   * @param {xxx} result -- xxx
   * @returns {undefined} -- undefined
   */
  generateReport: function(result) {
    if (result) {
      console.log("Test Report".bold)
      this._generateReportHelper(result, 0)
      this._generateReportSummary(result)
    }
  },

  /*****************************************************************************
   * @method _generateReportHelper
   * @description _generateReportHelper description
   * @param {xxx} result -- xxx
   * @param {xxx} level -- xxx
   * @returns {undefined} -- undefined
   */
  _generateReportHelper: function(result, level) {
    var self = this

    if (result && result.report) {
      var message = ""
      var statusColor = undefined
      if (result.skipped) {
        statusColor = "yellow"
      } else if (result.passed) {
        statusColor = "green"
      } else {
        statusColor = "red"
      }
      message = `[${"*"[statusColor]}]`
      message += ` Test: ${result.name}`
      if (result.skipped) {
        message += ` ${result.skippedTag}`
      }
      if (result.description) {
        message += ` (${result.description})`
      }

      // time
      message += ` (${result.time}ms)`

      this._log(message, level)

      if (result.skipped) {
        if (result.error.message.length > 0) {
          this._log(result.error.message.bold, level + 1)
        }
      } else if (result.error && !result.passed) {
        this._log(result.error.stack.bold, level + 2)
        if (result.error instanceof AssertionError && 'actual' in result.error &&
            'expected' in result.error) {
          this._log('deep-diff:\n' + inspect(diff(result.error.actual, result.error.expected),
                                   {depth: null, colors: true}),
                    level + 2)
        }
      }

      _.forEach(result.tests, function(r) {
        self._generateReportHelper(r, level + 1)
      })
    }
  },

  /*****************************************************************************
   * _generateReportSummary
   */
  _generateReportSummary: function(result) {
    function countTests(result) {
      function getCounts(result) {
        if (result.filtered) {
          return {passed: 0, failed: 0, skipped: 0, filtered: 1}
        }
        if (result.skipped) {
          return {passed: 0, failed: 0, skipped: 1, filtered: 0}
        }
        if (result.passed) {
          return {passed: 1, failed: 0, skipped: 0, filtered: 0}
        }
        return {passed: 0, failed: 1, skipped: 0, filtered: 0}
      }

      var counts = (!_.isNil(result.self) || _.isNil(result.tests) || result.tests.length === 0) ?
        getCounts(result) : {passed: 0, failed: 0, skipped: 0, filtered: 0}

      if (_.isNil(result.tests) || result.tests.length === 0) {
        return counts
      }

      _.forEach(result.tests, function(test) {
        var result_counts = countTests(test)
        counts.passed += result_counts.passed
        counts.failed += result_counts.failed
        counts.skipped += result_counts.skipped
        counts.filtered += result_counts.filtered
      })
      return counts
    }

    var counts = countTests(result)
    this._log('')
    this._log(counts.failed === 0 ? 'TESTS PASSED'.green.bold : 'TESTS FAILED'.red.bold)
    this._log(
      `${_.sum(_.values(counts))} tests run. ` +
      `${counts.filtered} tests filtered. ` +
      `${counts.passed} tests passed. ` +
      `${counts.failed} tests failed. ` +
      `${counts.skipped} tests skipped.`
    )
  }
})

module.exports = Test

// mitigate circular dependency
var util = require('./util')
