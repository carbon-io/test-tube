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
   * @description The base test class. This class can function both as a test-suite
   *              and as a test instance. Additionally, this class implements "_main"
   *              and will act as the entry point to a test-suite if constructed
   *              with ``atom.o.main``. Note, test-suites can be nested.
   * @memberof test-tube
   */
  _C: function() {
    /***************************************************************************
     * @property {string} name -- Name of the test. This is used for display
     *                            and filtering purposes.
     */
    this.name = path.basename(module.filename, path.extname(module.filename)) // name of this file without ex

    /***************************************************************************
     * @property {test-tube.Test[]} tests
     * @description A list of tests to execute as part of a test-suite. Note,
     *              these tests can themselves be test-suites.
     */
    this.tests = []

    /***************************************************************************
     * @property {Object} testContextClass
     * @description A class used to provide context and allow one to pass data
     *              between tests in the tree. Note, this can be useful when
     *              it is undesirable to store fixtures created in {@link
     *              test-tube.Test.setup} on the test instance itself.
     * @ignore
     */
    this.testContextClass = TestContext

    /***************************************************************************
     * @property {test-tube.Test} parent
     * @description A pointer to the "parent" test-suite. This is useful when
     *              a test needs to access a fixture created by the parent
     *              test-suite. It will be initialized by test-tube when the
     *              test tree is initialized.
     * @readonly
     */
    this.parent = undefined

    /***************************************************************************
     * @property {string} description
     * @description A short description of the test or test-suite used for display
     *              purposes
     */
    this.description = undefined

    /***************************************************************************
     * @property {boolean|Error} [errorExpected=false]
     * @description Indicate that an error is expected to be thrown in this test.
     *              This can be used as shorthand alternative to using
     *              ``assert.throws``. Note, if this is not a boolean, ``assert.throws``
     *              will be used to validate the error thrown by the test.
     */
    this.errorExpected = false

    /***************************************************************************
     * @property {boolean} [selfBeforeChildren=false]
     * @description A flag to indicate that {@link test-tube.Test.doTest} should
     *              be run before executing any tests in {@link test-tube.Test.tests}
     *              when an instance of {@link test-tube.Test} acts as both a test
     *              and a test-suite (top-down vs. bottom-up execution).
     */
    this.selfBeforeChildren = false

    // XXX: _mongoFixtures and _dbs will likely be going away, don't use
    /***************************************************************************
     * @property {Object.<string, string>} _mongoFixtures
     * @ignore
     */
    this._mongoFixtures = undefined

    /***************************************************************************
     * @property {Object.<string, leafnode.DB>} _dbs
     * @ignore
     */
    this._dbs = {}
  },

  /*****************************************************************************
   * @method _init
   * @description Initialize the test-suite
   * @returns {undefined}
   */
  _init: function() {
    this._initTests()
  },

  /*****************************************************************************
   * @method _initTest
   * @description Initialize a single test in the test-suite
   * @param {test-tube.Test} test -- An element in {@link test-tub.Test.tests}
   * @returns {test-tube.Test}
   */
  _initTest: function(test) {
    test.parent = this
    return test
  },

  /*****************************************************************************
   * @method _initTests
   * @description Initializes all tests in {@link test-tube.Test.tests}
   * @returns {undefined}
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
   * @description Generates a simplified Object representing the test instance
   *              suitable for serializing to JSON
   * @returns {Object}
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
   * @description See {@link test-tube.Test.toJSON} (note, expected by
   *              https://github.com/mongodb-js/extended-json description)
   * @returns {Object}
   * @ignore
   */
  serialize: function() {
    return this.toJSON()
  },

  /*****************************************************************************
   * @property {Object.<string, Object>} cmdargs
   * @description The ``cmdargs`` definition describing the command line interface
   *              when a test-suite is executed. See the ``atom`` documentation for
   *              a description of the format and options available.
   * @readonly
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
   * @property {Object} _main
   * @description The entry point definitions for commands issued on the command
   *              line.
   * @property {Function} _main.run
   * @description The entry point for the "run" command"
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
   * @description Setup any fixtures required for {@link test-tube.Test.doTest}
   *              or any test in {@linki test-tub.Test.tests}
   * @param {test-tube.TestContext} context -- A context object that can be used
   *                                           to pass data between tests or their
   *                                           methods.
   * @param {Function} done -- Errback to call when executing asynchronously. Note,
   *                           when implementing a test, if this is not included in
   *                           the parameter list, the test will be called synchronously
   *                           and you will not be responsible for calling the errback.
   * @returns {undefined}
   */
  setup: function(context, done) {
    done()
  },

  /*****************************************************************************
   * @method teardown
   * @description Teardown (cleanup) any fixtures that may have been created in
   *              {@link test-tube.Test.setup}
   * @param {test-tube.TestContext} context -- A context object that can be used
   *                                           to pass data between tests or their
   *                                           methods.
   * @param {Function} done -- Errback to call when executing asynchronously. Note,
   *                           when implementing a test, if this is not included in
   *                           the parameter list, the test will be called synchronously
   *                           and you will not be responsible for calling the errback.
   * @returns {undefined} -- undefined
   */
  teardown: function(context, done) {
    done()
  },

  /*****************************************************************************
   * @method _errorExpected
   * @description Updates test result if an error was expected and encountered
   * @param {Object} result -- A test result object (see
   *                           {@link test-tube.Test._buildTestResult})
   * @param {Error} error -- An error object as thrown by the test
   * @returns {Object} -- An updated test result object
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
   * @description Initializes the {@link test-tube.TestContext} object that will
   *              be passed down to every test in the tree
   * @param {test-tube.TestContext} [context] -- An existing context object
   * @throws {TypeError} -- Thrown if {@link test-tube.Test.testContextClass} is
   *                        not {@link test-tube.TestContext} or a subclass thereof
   * @returns {test-tube.TestContext} -- An instance of {@link test-tube.TestContext}
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
   * @description Internal hook that can be extended to perform some setup before
   *              the {@link test-tube.Test.run} method is called
   * @param {test-tube.TestContext} context -- A context object
   * @returns {undefined}
   */
  _prerun: function(context) {
    var name = this.name.indexOf('/') !== -1 ?
                  this.name.substring(0, this.name.indexOf('/')) : this.name
    context._tt.path = ppath.join(context._tt.path, name)
  },

  /*****************************************************************************
   * @method _postrun
   * @description Internal hook that can be extended to perform some teardown
   *              after the {@link test-tube.Test.run} method is called
   * @param {test-tube.TestContext} context -- A context object
   * @returns {undefined}
   */
  _postrun: function(context) {
    context._tt.path = ppath.dirname(context._tt.path)
  },

  /*****************************************************************************
   * @method _checkName
   * @description Checks if the current test is filtered by name (think ``basename``)
   * @param {test-tube.TestContext} context -- A context object
   * @returns {boolean} -- ``true`` if the test name is filtered, ``false``
   *                       otherwise
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
   * @description Checks if the current path is filtered where "path" is built
   *              using the test names as they appear in the depth-first traversal
   *              up to the current test being executed (think ``dirname``)
   * @param {test-tube.TestContext} context -- A context object
   * @param {boolean} [useDirname=false] -- Use ``path.dirname`` to grab the parent
   *                                        of the path retrieved from ``context``
   * @returns {boolean} -- ``true`` if the test path is filtered, ``false``
   *                       otherwise
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


  /*****************************************************************************
   * @typedef TestResult
   * @description The result of executing a test and it's sub-tests. Note, failures
   *              bubble up, so this result will be marked as not having passed
   *              if it or one of it's sub-tests does not pass.
   * @type {Object}
   * @memberof test-tube.Test
   * @property {string} name -- A test name
   * @property {string} description -- A test description
   * @property {boolean} passed -- A flag indicating the status of a test
   * @property {boolean} skipped -- A flag indicating whether a test was skipped
   * @property {string} skippedTag -- A tag used to augment the output line for
   *                                  a skipped test (defaults to "SKIPPED")
   * @property {boolean} filtered -- A flag indicating whether a test was filtered
   * @property {boolean} report -- A flag indicating whether a test should be
   *                               included in the final test-suite report
   * @property {Error} error -- An error thrown during test execution. Note,
   *                            this can happen in {@link test-tube.Test.setup},
   *                            {@link test-tube.Test.doTest}, or
   *                            {@link test-tube.Test.teardown}
   * @property {typedef:test-tube.Test.SelfTestResult} self -- An intermediate test
   *                                                           "result" object
   *                                                           representing the
   *                                                           result of this test's
   *                                                           {@link test-tube.Test.doTest}
   *                                                           method
   * @property {number} time -- The execution time of a test (and it's sub-tests)
   *                            in milliseconds
   * @property {typedef:test-tube.Test.TestResult[]} tests -- The test result
   *                                                          objects for all
   *                                                          sub-tests
   */

  /*****************************************************************************
   * @method _buildTestResult
   * @description A factory function for test result objects
   * @parameter {string} name -- A test name
   * @parameter {string} description -- A test description
   * @returns {typedef:test-tube.Test.TestResult}
   */
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
   * @param {test-tube.TestContext} context -- A context object
   * @param {Function} done -- Errback to call when executing asynchronously
   * @returns {typedef:test-tube.Test.TestResult}
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

  /*****************************************************************************
   * @typedef SelfTestResult
   * @description The result of executing a test
   * @type {Object}
   * @property {boolean} passed -- A flag indicating the status of a test
   * @property {boolean} skipped -- A flag indicating whether a test was skipped
   * @property {string} skippedTag -- A tag used to augment the output line for
   *                                  a skipped test (defaults to "SKIPPED")
   * @property {boolean} filtered -- A flag indicating whether a test was filtered
   * @property {Error} error -- An error thrown during test execution. Note, this
   *                            can happen in {@link test-tube.Test.setup},
   *                            {@link test-tube.Test.doTest}, or
   *                            {@link test-tube.Test.teardown}
   * @property {number} time -- The execution time of a test (and it's sub-tests)
   *                            in milliseconds
   */
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
   * @description Runs {@link test-tube.Test.doTest} and generates a result
   * @param {test-tube.TestContext} context -- A context object
   * @returns {typedef:test-tube.Test.SelfTestResult}
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
   * @description Logs a message to ``stdout``, indenting each line as appropriate
   * @param {string} msg -- A message to be logged
   * @param {number} level -- The number of spaces to indent the message
   * @returns {undefined}
   */
  _log: function(msg, level) {
    level = level || 0
    var header = " ".repeat(level)
    var lines = _.split(msg, '\n')
    for (i = 0; i < lines.length; i++) {
      console.log(header + lines[i])
    }
  },

  /*****************************************************************************
   * @method generateReport
   * @description Generate and output a report for the tests executed
   * @param {typedef:test-tube.Test.TestResult} result
   * @description The top-level test result object
   * @returns {undefined}
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
   * @description Recursively enerates and outputs the report for a test and
   *              sub-tests
   * @param {typedef:test-tube.Test} result -- The result object for this test
   * @param {number} level -- The depth of this test in the overall test tree
   * @returns {undefined}
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
   * @method _generateReportSummary
   * @description Generate and output a summary line for a test-suite
   * @param {typedef:test-tube.Test.TestResult} result
   * @description The result object for the test-suite
   * @returns {undefined}
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
