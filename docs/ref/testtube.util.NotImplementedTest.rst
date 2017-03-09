.. class:: testtube.util.NotImplementedTest
    :heading:

================================
testtube.util.NotImplementedTest
================================

:class:`~testtube.util.NotImplementedTest` is a convenience wrapper around
:js:class:`testtube.errors.NotImplementedTest`. This can be useful in situations
where you simply want to add a placeholder to revisited later.

Class
-----

.. class:: testtube.util.NotImplementedTest

    *extends*: :js:class:`testtube.Test`


Properties
----------

.. class:: testtube.util.NotImplementedTest
    :noindex:
    :hidden:

    .. attribute:: testtube.util.NotImplementedTest.name
        
        :type: ``string``
        :default: "NotImplementedTest"

        The test name.

    .. attribute:: testtube.util.NotImplementedTest.description
        
        :type: ``string``
        :default: "Not implemented"

        The test description. This will be used to set
        :js:attr:`testtube.errors.NotImplementedTest.message`.

Methods
-------

.. class:: testtube.util.NotImplementedTest
    :noindex:
    :hidden:

    .. function:: testtube.util.NotImplementedTest.doTest

        This method overrides :js:class:`testtube.Test.doTest` to throw a
        :js:class:`~testtube.errors.NotImplementedError`, using 
        :js:class:`~testtube.util.NotImplementedTest.description` for the error
        ``message``.

Example
-------

.. literalinclude:: ../code-frags/hello-world/test/skip-tests.js
    :language: js
    :linenos:
    :lines: 31-34
