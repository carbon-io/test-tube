.. class:: testtube.TestContext
    :heading:

====================
testtube.TestContext
====================

The :js:class:`~testtube.TestContext` class is used to manage state within and
across tests and allow for the test tree to be reentrant.

Class
-----

.. class:: testtube.TestContext


Properties
----------

.. class:: testtube.TestContext
    :noindex:
    :hidden:

    .. attribute:: testtube.TestContext.global

        :type: ``object``
        :default: ``{}`` 

        The ``global`` property should be used to manage state across multiple
        tests.

    .. attribute:: testtube.TestContext.local

        :type: ``object``
        :default: ``{}`` 

        The ``local`` property should be used to manage state in the context of
        a single test.

    .. attribute:: testtube.TestContext.httpHistory

        :type: :js:class:`~testtube.HttpTestHistory`

        When a new instance of an :js:class:`~testtube.HttpTest` is visited, this
        will be reinstantiated. If we are descending further down the tree, the
        current history will be saved and restored upon return.


.. Methods
.. -------

.. .. class:: testtube.TestContext
..    :noindex:
..    :hidden:


Example
-------

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
    :language: js
    :linenos:
    :lines: 106-142

