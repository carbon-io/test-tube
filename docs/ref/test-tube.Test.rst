.. class:: test-tube.Test
    :heading:

.. |br| raw:: html

   <br />

==============
test-tube.Test
==============

The base test class. This class can function both as a test-suite and as a test instance. Additionally, this class implements "_main" and will act as the entry point to a test-suite if constructed with ``atom.o.main``. Note, test-suites can be nested.

Instance Properties
-------------------

.. class:: test-tube.Test
    :noindex:
    :hidden:

    .. attribute:: cmdargs

       :type: Object.<string, Object>
       :ro:

       The ``cmdargs`` definition describing the command line interface when a test-suite is executed. See the ``atom`` documentation for a description of the format and options available.


    .. attribute:: description

       :type: string
       :required:

       A short description of the test or test-suite used for display purposes


    .. attribute:: errorExpected

       :type: boolean | Error
       :default: false

       Indicate that an error is expected to be thrown in this test. This can be used as shorthand alternative to using ``assert.throws``. Note, if this is not a boolean, ``assert.throws`` will be used to validate the error thrown by the test.


    .. attribute:: name

       :type: string
       :required:

       Name of the test. This is used for display and filtering purposes.


    .. attribute:: parent

       :type: test-tube.Test
       :ro:

       A pointer to the "parent" test-suite. This is useful when a test needs to access a fixture created by the parent test-suite. It will be initialized by test-tube when the test tree is initialized.


    .. attribute:: selfBeforeChildren

       :type: boolean
       :default: false

       A flag to indicate that :class:`~test-tube.Test.doTest` should be run before executing any tests in :class:`~test-tube.Test.tests` when an instance of :class:`~test-tube.Test` acts as both a test and a test-suite (top-down vs. bottom-up execution).


    .. attribute:: tests

       :type: test-tube.Test[]
       :required:

       A list of tests to execute as part of a test-suite. Note, these tests can themselves be test-suites.


Methods
-------

.. class:: test-tube.Test
    :noindex:
    :hidden:

    .. function:: generateReport(result)

        :param result: undefined
        :type result: :ref:`TestResult <test-tube.Test.TestResult>`
        :rtype: undefined

        The top-level test result object

    .. function:: run(context, done)

        :param context: A context object
        :type context: test-tube.TestContext
        :param done: Errback to call when executing asynchronously
        :type done: function
        :rtype: :ref:`TestResult <test-tube.Test.TestResult>`

        run description

    .. function:: setup(context, done)

        :param context: A context object that can be used to pass data between tests or their methods.
        :type context: test-tube.TestContext
        :param done: Errback to call when executing asynchronously. Note, when implementing a test, if this is not included in the parameter list, the test will be called synchronously and you will not be responsible for calling the errback.
        :type done: function
        :rtype: undefined

        Setup any fixtures required for :class:`~test-tube.Test.doTest` or any test in :class:`~i test-tub.Test.tests`

    .. function:: teardown(context, done)

        :param context: A context object that can be used to pass data between tests or their methods.
        :type context: test-tube.TestContext
        :param done: Errback to call when executing asynchronously. Note, when implementing a test, if this is not included in the parameter list, the test will be called synchronously and you will not be responsible for calling the errback.
        :type done: function
        :returns: undefined
        :rtype: undefined

        Teardown (cleanup) any fixtures that may have been created in :class:`~test-tube.Test.setup`

    .. function:: toJSON()

        :rtype: Object

        Generates a simplified Object representing the test instance suitable for serializing to JSON

.. _test-tube.Test.SelfTestResult:

.. rubric:: Typedef: SelfTestResult

Properties
----------

    .. attribute:: passed

       :type: boolean
       :required:

       A flag indicating the status of a test


    .. attribute:: skipped

       :type: boolean
       :required:

       A flag indicating whether a test was skipped


    .. attribute:: skippedTag

       :type: string
       :required:

       A tag used to augment the output line for a skipped test (defaults to "SKIPPED")


    .. attribute:: filtered

       :type: boolean
       :required:

       A flag indicating whether a test was filtered


    .. attribute:: error

       :type: Error
       :required:

       


    .. attribute:: time

       :type: number
       :required:

       The execution time of a test (and it's sub-tests) in milliseconds


.. _test-tube.Test.TestResult:

.. rubric:: Typedef: TestResult

Properties
----------

    .. attribute:: name

       :type: string
       :required:

       A test name


    .. attribute:: description

       :type: string
       :required:

       A test description


    .. attribute:: passed

       :type: boolean
       :required:

       A flag indicating the status of a test


    .. attribute:: skipped

       :type: boolean
       :required:

       A flag indicating whether a test was skipped


    .. attribute:: skippedTag

       :type: string
       :required:

       A tag used to augment the output line for a skipped test (defaults to "SKIPPED")


    .. attribute:: filtered

       :type: boolean
       :required:

       A flag indicating whether a test was filtered


    .. attribute:: report

       :type: boolean
       :required:

       A flag indicating whether a test should be included in the final test-suite report


    .. attribute:: error

       :type: Error
       :required:

       


    .. attribute:: self

       :type: :ref:`SelfTestResult <test-tube.Test.SelfTestResult>`
       :required:

       


    .. attribute:: time

       :type: number
       :required:

       The execution time of a test (and it's sub-tests) in milliseconds


    .. attribute:: tests

       :type: :ref:`TestResult[] <test-tube.Test.TestResult[]>`
       :required:

       

