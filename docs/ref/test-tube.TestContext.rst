.. class:: test-tube.TestContext
    :heading:

.. |br| raw:: html

   <br />

=====================
test-tube.TestContext
=====================

A class used to maintain state across tests in the test-suite. An instance of this class will be created for each top-level call to run a test-suite and can be used to hold user state (e.g., fixtures generated in :class:`~test-tube.Test.setup`) in addition to maintaining internal state to test-tube itself.

Instance Properties
-------------------

.. class:: test-tube.TestContext
    :noindex:
    :hidden:

    .. attribute:: global

       :type: Object
       :required:

       A free form object used to store state across all tests executing as part of a test-suite


    .. attribute:: httpHistory

       :type: test-tube.HttpTestHistory
       :required:

       The current HTTP request and response history. This can be used by sub-tests of an :class:`~test-tube.HttpTest`


    .. attribute:: local

       :type: Object
       :required:

       A free form object used to store state during the execution of a single test in the test-suite. This state will be stashed during the execution of any sub-tests and restored upon their completion.


Methods
-------

.. class:: test-tube.TestContext
    :noindex:
    :hidden:

    .. function:: restore()

        :returns: The new value of {@link test-tube.TestContext.local
        :rtype: Object

        Sets :class:`~test-tube.TestContext.local` to the last value that was stashed and removes it from the stack

    .. function:: stash(state)

        :param state: undefined
        :type state: Object
        :returns: The new value of :class:`~test-tube.TestContext.local`
        :rtype: Object

        The new value of :class:`~test-tube.TestContext.local`

.. _test-tube.TestContext.InternalTestContext:

.. rubric:: Typedef: InternalTestContext

Properties
----------

    .. attribute:: options

       :type: Object
       :required:

       


    .. attribute:: global

       :type: Object
       :required:

       


    .. attribute:: local

       :type: Object
       :required:

       


    .. attribute:: localStateStack

       :type: Object[]
       :required:

       


    .. attribute:: httpHistory

       :type: test-tube.HttpTestHistory
       :required:

       


    .. attribute:: path

       :type: string
       :required:

       

