.. class:: testtube.util.SkipTest
    :heading:

======================
testtube.util.SkipTest
======================

:class:`~testtube.util.SkipTest` is a convenience wrapper around
:js:class:`testtube.errors.SkipTestError`. This can be useful in situations
where the testing environment does not allow for a test to execute successfully.
In cases like this, you can check for some condition in the module that
implements the test and set ``module.exports`` appropriately based on whether or
not that condition was satisfied.

Class
-----

.. class:: testtube.util.SkipTest

    *extends*: :js:class:`testtube.Test`


Properties
----------

.. class:: testtube.util.SkipTest
    :noindex:
    :hidden:

    .. attribute:: testtube.util.SkipTest.name
        
        :type: ``string``
        :default: "SkipTest"

        The test name.

    .. attribute:: testtube.util.SkipTest.description
        
        :type: ``string``
        :default: "Skip test"

        The test description. This will be used to set
        :js:attr:`testtube.errors.SkipTestError.message`.

Methods
-------

.. class:: testtube.util.SkipTest
    :noindex:
    :hidden:
    
    .. function:: testtube.util.SkipTest.doTest

        This method overrides :js:class:`testtube.Test.doTest` to throw a
        :js:class:`~testtube.errors.SkipTest`, using 
        :js:class:`~testtube.util.SkipTest.description` for the error
        ``message``.

Example
-------

.. literalinclude:: ../code-frags/hello-world/test/skip-tests.js
    :language: js
    :linenos:
    :lines: 21-24
