.. class:: testtube.HttpTestHistory
    :heading:

========================
testtube.HttpTestHistory
========================

:js:class:`~testtube.HttpTestHistory` manages ``http`` request and response history for a :js:class:`~testtube.HttpTest`.

Class
-----

.. class:: testtube.HttpTestHistory


Properties
----------

.. class:: testtube.HttpTestHistory
    :noindex:
    :hidden:

    .. attribute:: length
    
        :type: ``integer``

        The number of saeed requests/responses.

Methods
-------

.. class:: testtube.HttpTestHistory
    :noindex:
    :hidden:

    .. function:: testtube.HttpTestHistory.addReqSpec

        :param name: a handle that can later be used to retrieve the ``reqSpec``
        :type name: ``string``
        :param reqSpec: the ``reqSpec`` to record
        :type reqSpec: ``object``

        Add a ``reqSpec`` to the history.

    .. function:: testtube.HttpTestHistory.addResSpec

        :param name: a handle that can later be used to retrieve the ``resSpec``
        :type name: ``string``
        :param resSpec: the ``resSpec`` to record
        :type resSpec: ``object``

        Add a ``resSpec`` to the history.

    .. function:: testtube.HttpTestHistory.addReq

        :param name: a handle that can later be used to retrieve the ``req``
        :type name: ``string``
        :param req: the ``req`` to record
        :type req: ``object``

        Add a ``req`` to the history.

    .. function:: testtube.HttpTestHistory.addRes

        :param name: a handle that can later be used to retrieve the ``res``
        :type name: ``string``
        :param req: the ``res`` to record
        :type req: ``object``

        Add a ``res`` to the history.

    .. function:: testtube.HttpTestHistory.getReqSpec

        :param index: the index of the ``reqSpec`` to retrieve
        :type index: ``string`` | ``integer``
        :returns: ``reqSpec``
        :raises: :js:class:`RangeError`

        Retrieve the ``reqSpec`` at ``index``, where index can be a test name, a
        negative ``integer`` to walk backward from the current request/response
        cycle, or a positive ``integer`` to walk forward from the beginning of
        the test suite.

    .. function:: testtube.HttpTestHistory.getResSpec

        :param index: the index of the ``resSpec`` to retrieve
        :type index: ``string`` | ``integer``
        :returns: ``resSpec``
        :raises: :js:class:`RangeError`

        Retrieve the ``resSpec`` at ``index`` (see
        :js:func:`~testtube.HttpTest.getReqSpec` for description of ``index``).

    .. function:: testtube.HttpTestHistory.getReq

        :param index: the index of the ``req`` to retrieve
        :type index: ``string`` | ``integer``
        :returns: ``req``
        :raises: :js:class:`RangeError`

        Retrieve the ``req`` at ``index`` (see
        :js:func:`~testtube.HttpTest.getReqSpec` for description of ``index``).

    .. function:: testtube.HttpTestHistory.getRes

        :param index: the index of the ``res`` to retrieve
        :type index: ``string`` | ``integer``
        :returns: ``res``
        :raises: :js:class:`RangeError`

        Retrieve the ``res`` at ``index`` (see
        :js:func:`~testtube.HttpTest.getReqSpec` for description of ``index``).
    
    .. function:: testtube.HttpTestHistory.get

        :param index: the index of the request/response cycle to retrieve
        :type index: ``string`` | ``integer``
        :returns: an object that contains the ``reqSpec``, ``resSpec``, 
                  ``req``, and ``res`` for ``index``
        :raises: :js:class:`RangeError`

        Retrieve all history at ``index`` (see
        :js:func:`~testtube.HttpTest.getReqSpec` for description of ``index``).

Example
-------

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
  :language: js
  :linenos:

