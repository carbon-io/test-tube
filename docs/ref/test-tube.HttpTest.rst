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

    .. attribute:: method

       :type: string
       :required:

       The HTTP request method to use (e.g., "GET", "POST", "PUT", etc.)


    .. attribute:: url

       :type: string
       :required:

       The URL that should be requested. Note, :class:`~test-tube.HttpTest.baseUrl` will be prepended to this value when making the request.


    .. attribute:: parameters

       :type: Object
       :required:

       The query string parameters to include in the request URL


    .. attribute:: headers

       :type: Object
       :required:

       The headers to include with the request


    .. attribute:: body

       :type: Object | Array
       :required:

       The body to include with the request


    .. attribute:: options

       :type: Object
       :required:

       Options that should be passed directly to the underlying "requests" module


.. _test-tube.HttpTest.ResSpec:

.. rubric:: Typedef: ResSpec

Properties
----------

    .. attribute:: statusCode

       :type: number | function
       :required:

       The HTTP status code of the


    .. attribute:: headers

       :type: Object | function
       :required:

       The response headers


    .. attribute:: body

       :type: Object | Array | function
       :required:

       The response body


.. _test-tube.HttpTest.TestSpec:

.. rubric:: Typedef: TestSpec

Properties
----------

    .. attribute:: name

       :type: string
       :required:

       Used to name the test (note, a name will be generated using the method and URL if this is omitted)


    .. attribute:: description

       :type: string
       :required:

       See :class:`~test-tube.Test.description`


    .. attribute:: setup

       :type: function
       :required:

       See :class:`~test-tube.Test.setup`


    .. attribute:: teardown

       :type: function
       :required:

       See :class:`~test-tube.Test.teardown`


    .. attribute:: reqSpec

       :type: :ref:`ReqSpec <test-tube.HttpTest.ReqSpec>`
       :required:

       A specification of the request to be sent


    .. attribute:: resSpec

       :type: :ref:`ResSpec <test-tube.HttpTest.ResSpec>`
       :required:

       A specification of the response expected

