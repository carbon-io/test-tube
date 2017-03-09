.. class:: testtube.Test
    :heading:

=============
testtube.Test
=============

:js:class:`~testtube.Test` is the base test class that all tests should
instantiate and all test classes (e.g., :js:class:`~testtube.HttpTest`) should
inherit from.

Class
-----

.. class:: testtube.Test


Properties
----------

.. class:: testtube.Test
    :noindex:
    :hidden:
    
    .. attribute:: testtube.Test.name

        :type: ``string``
        :default: the module's filename (sans extension)

        A descriptive name for the test or test suite.

    .. attribute:: testtube.Test.description

        :type: ``string``
        :default: ``undefined`` 

        A short description of the test or test suite.

    .. attribute:: testtube.Test.parent
        
        :type: :js:class:`~testtube.Test`
        :default: ``undefined`` 

        A back reference to the test's parent.

    .. attribute:: testtube.Test.errorExpected
        
        :type: ``boolean`` | :js:class:`Error` | ``function``
        :default: ``false`` 

        Indicate that an error is expected to be thrown somewhere in the test
        and, if desired, verify the type of contents of that error (see:
        :js:func:`assert.throws`.

    .. attribute:: testtube.Test.selfBeforeChildren
        
        :type: ``boolean``
        :default: ``false`` 

        If both :js:func:`~testtube.Test.doTest` and
        :js:func:`~testtube.Test.tests` are defined, execute
        :js:func:`~testtube.Test.doTest` before iterating through
        :js:func:`~testtube.Test.tests`.

    .. attribute:: testtube.Test.tests

        :type: :js:class:`Array`
        :default: ``[]`` 

        Child tests to be executed as part of the test suite.
    

Methods
-------

.. class:: testtube.Test
    :noindex:
    :hidden:

    .. function:: testtube.Test.setup

        :param context: the test context
        :type context: :js:class:`~testtube.TestContext`
        :param done: callback used to end asynchronous tests
        :type done: ``function`` 

        Called before :js:func:`~testtube.Test.doTest` and/or before iterating
        through :js:attr:`~testtube.Test.tests`. Both arguments are optional,
        but will determine how the test runner calls this method. If there is one
        argument in the signature, the context will be passed. If there are two,
        the second parameter must be called for execution to continue.

        NOTE: It is OK to throw assertions in this method.

    .. function:: testtube.Test.teardown

        :param context: the test context
        :type context: :js:class:`~testtube.TestContext`
        :param done: callback used to end asynchronous tests
        :type done: ``function`` 

        Called after :js:func:`~testtube.Test.doTest` and/or after iterating
        through :js:attr:`~testtube.Test.tests`. The arguments and the semantics
        they imply are the same as for ``setup``.

        NOTE: It is OK to throw assertions in this method.

    .. function:: testtube.Test.doTest

        :param context: the test context
        :type context: :js:class:`~testtube.TestContext`
        :param done: callback used to end asynchronous tests
        :type done: ``function`` 

        Called to execute the test. If no error is thrown, the test will be
        marked a success.  The arguments and the semantics they imply are the
        same as for ``setup``.

    .. function:: testtube.Test.run

        :param context: the test context
        :type context: :js:class:`~testtube.TestContext`
        :param done: callback used to end asynchronous tests
        :type done: ``function`` 

        This can be called directly to begin execution of a test suite
        programmatically. It will log tests and their results during execution
        and return a results object for inspection, but will *not* generate the
        formatted report. The arguments and the semantics they imply are the
        same as for ``setup``.

Example
-------

.. literalinclude:: ../code-frags/hello-world/test/simple-tests.js
    :language: js
    :linenos:



