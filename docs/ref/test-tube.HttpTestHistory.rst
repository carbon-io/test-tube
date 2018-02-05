.. class:: test-tube.HttpTestHistory
    :heading:

.. |br| raw:: html

   <br />

=========================
test-tube.HttpTestHistory
=========================

A class to manage the history of HTTP requests, responses, request specs, and response specs. This is useful during the execution of an :class:`~test-tube.HttpTest` if you want to replay requests or validate that the response matches a previous response. Note, this is accessible during test execution using :class:`~test-tube.TestContext.httpHistory`.

Instance Properties
-------------------

.. class:: test-tube.HttpTestHistory
    :noindex:
    :hidden:

    .. attribute:: _requests

       :type: :class:`~carbond.Request[]`
       :required:

       The request history


    .. attribute:: _requestSpecs

       :type: :ref:`ReqSpec[] <test-tube.HttpTest.ReqSpec>`
       :required:

       The request spec history


    .. attribute:: _responses

       :type: :class:`~carbond.Response[]`
       :required:

       The response history


    .. attribute:: _responseSpecs

       :type: :ref:`ResSpec <test-tube.HttpTest.ResSpec>`
       :required:

       The response spec history


    .. attribute:: length

       :type: number
       :required:

       The current number of elements in the history


Methods
-------

.. class:: test-tube.HttpTestHistory
    :noindex:
    :hidden:

    .. function:: _get(index, target)

        :param index: The index/name of the element to retrieve. If this is a number, it can be negative.
        :type index: number | string
        :param target: The history object for request specs, response specs, requests, or responses
        :type target: Object[]
        :throws: RangeError 
        :rtype: Object

        _get description

    .. function:: addReq(name, req)

        :param name: A name to reference the request spec by (pulled from the test name)
        :type name: string
        :param req: A request
        :type req: :class:`~carbond.Request`
        :rtype: undefined

        Add a request

    .. function:: addReqSpec(name, reqSpec)

        :param name: A name to reference the request spec by (pulled from the test name)
        :type name: string
        :param reqSpec: A request spec
        :type reqSpec: :ref:`ReqSpec <test-tube.HttpTest.ReqSpec>`
        :rtype: undefined

        Add a request spec to the history

    .. function:: addRes(name, res)

        :param name: A name to reference the response spec by (pulled from the test name)
        :type name: string
        :param res: A response
        :type res: :class:`~carbond.Request`
        :rtype: undefined

        Add a response

    .. function:: addResSpec(name, resSpec)

        :param name: A name to reference the response spec by (pulled from the test name)
        :type name: string
        :param resSpec: A response spec
        :type resSpec: :ref:`ResSpec <test-tube.HttpTest.ResSpec>`
        :returns: undefined
        :rtype: undefined

        Add a response spec to the history

    .. function:: get(index)

        :param index: The index or name of the history element to retrieve. If this is a number, it can be negative.
        :type index: number | string
        :returns: Keys are "reqSpec", "resSpec", "req", and "res"
        :rtype: Object

        Get a request spec, response spec, request, and response

    .. function:: getReq(index)

        :param index: The index or name of the request to retrieve. If this is a number, it can be negative.
        :type index: number | string
        :rtype: :class:`~carbond.Request`

        Get a request

    .. function:: getReqSpec(index)

        :param index: The index or name of the request spec to retrieve. If this is a number, it can be negative.
        :type index: number | string
        :rtype: :ref:`ReqSpec <test-tube.HttpTest.ReqSpec>`

        Get a request spec

    .. function:: getRes(index)

        :param index: The index or name of the response to retrieve. If this is a number, it can be negative.
        :type index: number | string
        :rtype: :class:`~carbond.Response`

        Get a response

    .. function:: getResSpec(index)

        :param index: The index or name of the response spec to retrieve. If this is a number, it can be negative.
        :type index: number | string
        :rtype: :ref:`ResSpec <test-tube.HttpTest.ResSpec>`

        Get a response spec
