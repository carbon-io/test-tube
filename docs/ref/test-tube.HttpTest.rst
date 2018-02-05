.. class:: test-tube.HttpTest
    :heading:

.. |br| raw:: html

   <br />

==================
test-tube.HttpTest
==================
*extends* :class:`~test-tube.Test`

An extension of :class:`~test-tube.Test` that simplifies testing of HTTP based web services. In general, this will be used as a test-suite, as it parses the sub-tests to build test objects that make HTTP requests and validate HTTP responses using a simple specification format. Services that are being tested can be started in a parent test or using :class:`~test-tube.HttpTest.setup`. Similarly, services can be stopped in a parent test or using :class:`~test-tube.HttpTest.teardown`.

Instance Properties
-------------------

.. class:: test-tube.HttpTest
    :noindex:
    :hidden:

    .. attribute:: _main

       :inheritedFrom: :class:`~test-tube.Test`
       :type: Object
       :required:

       The entry point for the "run" command"

       .. csv-table::
          :class: details-table
          :header: "Name", "Type", "Default", "Description"
          :widths: 10, 10, 10, 10

          run, ``function``, ``undefined``, undefined



    .. attribute:: baseUrl

       :type: string
       :required:

       The base URL for all tests in the test-suite. This will be prepended to any URL specified in the suite.


    .. attribute:: cmdargs

       :inheritedFrom: :class:`~test-tube.Test`
       :type: Object.<string, Object>
       :ro:

       The ``cmdargs`` definition describing the command line interface when a test-suite is executed. See the ``atom`` documentation for a description of the format and options available.


    .. attribute:: description

       :inheritedFrom: :class:`~test-tube.Test`
       :type: string
       :required:

       A short description of the test or test-suite used for display purposes


    .. attribute:: errorExpected

       :inheritedFrom: :class:`~test-tube.Test`
       :type: boolean | Error
       :default: false

       Indicate that an error is expected to be thrown in this test. This can be used as shorthand alternative to using ``assert.throws``. Note, if this is not a boolean, ``assert.throws`` will be used to validate the error thrown by the test.


    .. attribute:: name

       :inheritedFrom: :class:`~test-tube.Test`
       :type: string
       :required:

       Name of the test. This is used for display and filtering purposes.


    .. attribute:: parent

       :inheritedFrom: :class:`~test-tube.Test`
       :type: test-tube.Test
       :ro:

       A pointer to the "parent" test-suite. This is useful when a test needs to access a fixture created by the parent test-suite. It will be initialized by test-tube when the test tree is initialized.


    .. attribute:: selfBeforeChildren

       :inheritedFrom: :class:`~test-tube.Test`
       :type: boolean
       :default: false

       A flag to indicate that :class:`~test-tube.Test.doTest` should be run before executing any tests in :class:`~test-tube.Test.tests` when an instance of :class:`~test-tube.Test` acts as both a test and a test-suite (top-down vs. bottom-up execution).


    .. attribute:: tests

       :inheritedFrom: :class:`~test-tube.Test`
       :type: test-tube.Test[]
       :required:

       A list of tests to execute as part of a test-suite. Note, these tests can themselves be test-suites.


Methods
-------

.. class:: test-tube.HttpTest
    :noindex:
    :hidden:

    .. function:: _buildTestResult()

        :inheritedFrom: :class:`~test-tube.Test`
        :rtype: :ref:`TestResult <test-tube.Test.TestResult>`

        A factory function for test result objects

    .. function:: _checkName(context)

        :inheritedFrom: :class:`~test-tube.Test`
        :param context: A context object
        :type context: test-tube.TestContext
        :returns: ``true`` if the test name is filtered, ``false`` otherwise
        :rtype: boolean

        Checks if the current test is filtered by name (think ``basename``)

    .. function:: _checkPath(context, useDirname)

        :inheritedFrom: :class:`~test-tube.Test`
        :param context: A context object
        :type context: test-tube.TestContext
        :param useDirname: Use ``path.dirname`` to grab the parent of the path retrieved from ``context``
        :type useDirname: boolean
        :returns: ``true`` if the test path is filtered, ``false`` otherwise
        :rtype: boolean

        Checks if the current path is filtered where "path" is built using the test names as they appear in the depth-first traversal up to the current test being executed (think ``dirname``)

    .. function:: _errorExpected(result, error)

        :inheritedFrom: :class:`~test-tube.Test`
        :param result: A test result object (see :class:`~test-tube.Test._buildTestResult`)
        :type result: Object
        :param error: An error object as thrown by the test
        :type error: Error
        :returns: An updated test result object
        :rtype: Object

        Updates test result if an error was expected and encountered

    .. function:: _executeHttpTest(test, context, cb)

        :param test: A test in the test-suite
        :type test: test-tube.Test
        :param context: A context object
        :type context: test-tube.TestContext
        :param cb: An errback
        :type cb: function
        :rtype: undefined

        Runs a test in the test-suite

    .. function:: _generateReportHelper(result, level)

        :inheritedFrom: :class:`~test-tube.Test`
        :param result: The result object for this test
        :type result: :ref:`TestResult <test-tube.Test.TestResult>`
        :param level: The depth of this test in the overall test tree
        :type level: number
        :rtype: undefined

        Recursively enerates and outputs the report for a test and sub-tests

    .. function:: _generateReportSummary(result)

        :inheritedFrom: :class:`~test-tube.Test`
        :param result: undefined
        :type result: :ref:`TestResult <test-tube.Test.TestResult>`
        :rtype: undefined

        The result object for the test-suite

    .. function:: _init()

        :rtype: undefined

        Initialize the test object

    .. function:: _initContext(context)

        :inheritedFrom: :class:`~test-tube.Test`
        :param context: An existing context object
        :type context: test-tube.TestContext
        :throws: TypeError Thrown if :class:`~test-tube.Test.testContextClass` is not :class:`~test-tube.TestContext` or a subclass thereof
        :returns: An instance of :class:`~test-tube.TestContext`
        :rtype: test-tube.TestContext

        Initializes the :class:`~test-tube.TestContext` object that will be passed down to every test in the tree

    .. function:: _initTest(test)

        :param test: undefined
        :type test: :ref:`TestSpec <test-tube.HttpTest.TestSpec>` | test-tube.Test
        :rtype: test-tube.Test

        The test spec (note, if this is already an instance of :class:`~test-tube.Test`, it will simply be returned)

    .. function:: _initTests()

        :rtype: undefined

        Runs :class:`~test-tube.HttpTest._initTest` on each test in :class:`~test-tube.HttpTest.tests`. Note, this will replace any :ref:`TestSpec <test-tube.HttpTest.TestSpec>` with an instance of :class:`~test-tube.Test` that implements the spec.

    .. function:: _log(msg, level)

        :inheritedFrom: :class:`~test-tube.Test`
        :param msg: A message to be logged
        :type msg: string
        :param level: The number of spaces to indent the message
        :type level: number
        :rtype: undefined

        Logs a message to ``stdout``, indenting each line as appropriate

    .. function:: _postrun(context)

        :param context: A context object
        :type context: test-tube.TestContext
        :rtype: undefined

        Restores the previous :class:`~test-tube.HttpHistory` object if one existed

    .. function:: _prerun(context)

        :param context: A context object
        :type context: test-tube.TestContext
        :rtype: undefined

        Creates a new :class:`~test-tube.HttpHistory` object for this test-suite and stashes any previous history object that may be present in order to restore it when this suite finishes execution.

    .. function:: _runSelf(context)

        :inheritedFrom: :class:`~test-tube.Test`
        :param context: A context object
        :type context: test-tube.TestContext
        :rtype: :ref:`SelfTestResult <test-tube.Test.SelfTestResult>`

        Runs :class:`~test-tube.Test.doTest` and generates a result

    .. function:: generateReport(result)

        :inheritedFrom: :class:`~test-tube.Test`
        :param result: undefined
        :type result: :ref:`TestResult <test-tube.Test.TestResult>`
        :rtype: undefined

        The top-level test result object

    .. function:: run(context, done)

        :inheritedFrom: :class:`~test-tube.Test`
        :param context: A context object
        :type context: test-tube.TestContext
        :param done: Errback to call when executing asynchronously
        :type done: function
        :rtype: :ref:`TestResult <test-tube.Test.TestResult>`

        run description

    .. function:: setup(context, done)

        :inheritedFrom: :class:`~test-tube.Test`
        :param context: A context object that can be used to pass data between tests or their methods.
        :type context: test-tube.TestContext
        :param done: Errback to call when executing asynchronously. Note, when implementing a test, if this is not included in the parameter list, the test will be called synchronously and you will not be responsible for calling the errback.
        :type done: function
        :rtype: undefined

        Setup any fixtures required for :class:`~test-tube.Test.doTest` or any test in :class:`~i test-tub.Test.tests`

    .. function:: teardown(context, done)

        :inheritedFrom: :class:`~test-tube.Test`
        :param context: A context object that can be used to pass data between tests or their methods.
        :type context: test-tube.TestContext
        :param done: Errback to call when executing asynchronously. Note, when implementing a test, if this is not included in the parameter list, the test will be called synchronously and you will not be responsible for calling the errback.
        :type done: function
        :returns: undefined
        :rtype: undefined

        Teardown (cleanup) any fixtures that may have been created in :class:`~test-tube.Test.setup`

    .. function:: toJSON()

        :inheritedFrom: :class:`~test-tube.Test`
        :rtype: Object

        Generates a simplified Object representing the test instance suitable for serializing to JSON

.. _test-tube.HttpTest.ReqSpec:

.. rubric:: Typedef: ReqSpec

Properties
----------

    .. attribute:: test-tube.HttpTest.ReqSpec.method

       :type: string
       :required:

       The HTTP request method to use (e.g., "GET", "POST", "PUT", etc.)


    .. attribute:: test-tube.HttpTest.ReqSpec.url

       :type: string
       :required:

       The URL that should be requested. Note, :class:`~test-tube.HttpTest.baseUrl` will be prepended to this value when making the request.


    .. attribute:: test-tube.HttpTest.ReqSpec.parameters

       :type: Object
       :required:

       The query string parameters to include in the request URL


    .. attribute:: test-tube.HttpTest.ReqSpec.headers

       :type: Object
       :required:

       The headers to include with the request


    .. attribute:: test-tube.HttpTest.ReqSpec.body

       :type: Object | Array
       :required:

       The body to include with the request


    .. attribute:: test-tube.HttpTest.ReqSpec.options

       :type: Object
       :required:

       Options that should be passed directly to the underlying "requests" module


.. _test-tube.HttpTest.ResSpec:

.. rubric:: Typedef: ResSpec

Properties
----------

    .. attribute:: test-tube.HttpTest.ResSpec.statusCode

       :type: number | function
       :required:

       The HTTP status code of the


    .. attribute:: test-tube.HttpTest.ResSpec.headers

       :type: Object | function
       :required:

       The response headers


    .. attribute:: test-tube.HttpTest.ResSpec.body

       :type: Object | Array | function
       :required:

       The response body


.. _test-tube.HttpTest.TestSpec:

.. rubric:: Typedef: TestSpec

Properties
----------

    .. attribute:: test-tube.HttpTest.TestSpec.name

       :type: string
       :required:

       Used to name the test (note, a name will be generated using the method and URL if this is omitted)


    .. attribute:: test-tube.HttpTest.TestSpec.description

       :type: string
       :required:

       See :class:`~test-tube.Test.description`


    .. attribute:: test-tube.HttpTest.TestSpec.setup

       :type: function
       :required:

       See :class:`~test-tube.Test.setup`


    .. attribute:: test-tube.HttpTest.TestSpec.teardown

       :type: function
       :required:

       See :class:`~test-tube.Test.teardown`


    .. attribute:: test-tube.HttpTest.TestSpec.reqSpec

       :type: :ref:`ReqSpec <test-tube.HttpTest.ReqSpec>`
       :required:

       A specification of the request to be sent


    .. attribute:: test-tube.HttpTest.TestSpec.resSpec

       :type: :ref:`ResSpec <test-tube.HttpTest.ResSpec>`
       :required:

       A specification of the response expected

