.. class:: testtube.HttpTest
    :heading:

=================
testtube.HttpTest
=================

:js:class:`~testtube.HttpTest` extends :js:class:`~testtube.Test` to make it
easier to write unit tests for ``http`` based services.

Class
-----

.. class:: testtube.HttpTest

  *extends*: :js:class:`~testtube.Test`

Properties
----------

.. class:: testtube.HttpTest
    :noindex:
    :hidden:

    .. attribute:: testtube.HttpTest.baseUrl

        :type: ``string``
        :default: ``undefined``

        Used as the base for all relative URLs in the test suite.

    .. attribute:: testtube.HttpTest.tests
        
        :type: :js:class:`Array`
        :default: ``[]``

        Unlike :js:attr:`testtube.Test.tests`,
        :js:attr:`testtube.HttpTest.tests` may contain
        non-:js:class:`~testtube.Test` based objects that are used as shorthand
        for writing tests that will be issuing ``http`` requests and validating
        the corresponding responses. These other objects should have at least
        two properties: ``reqSpec`` and ``resSpec``.  At runtime, valid
        :js:class:`~testtube.Test` objects will be constructed and executed
        based on these specs (see: :ref:`HttpTest guide
        <test-tube-guide-http-test>` for more information).

Example
-------

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
     :language: js
     :linenos:



