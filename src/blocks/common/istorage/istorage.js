window.IStorage = window.IStorage || (function() {
  var
    CLASS_NAMES = {
      iframe: 'istorage js-istorage',
    },
    ACTION_TYPES = {
      getRequest: 'getRequest',
      getResponse: 'getResponse',

      setRequest: 'setRequest',
      setResponse: 'setResponse',

      triggerRequest: 'triggerRequest',
      triggerResponse: 'triggerResponse',
    },
    _requestID = 0,
    _requests = {},
    _listeners = {},
    _sendMessageFns = [],
    _iframeEl,
    _localStorage;

  function _sendMessage(data) {
    _isIframeLoaded() ?
      _postMessageOnCurrentWindow(data) :
      _sendMessageOnIframeLoad(function() { _postMessageOnCurrentWindow(data); }, data.payload.key);
  }

  function _sendMessageOnIframeLoad(sendMessageFn) {
    _sendMessageFns.push(sendMessageFn);

    if (!_iframeEl) {
      _iframeEl = _createIframe();
      document.body.append(_iframeEl);

      _iframeEl.onload = function() {
        _iframeEl.dataset.isLoaded = true;
        _sendMessageFns.forEach(function(fun) { fun(); });
      };
    }
  }

  function _postMessage(target, data) {
    target.postMessage(JSON.stringify(data), '*');
  }

  function _postMessageOnCurrentWindow(data) {
    _postMessage(_getCurrentWindow(), data);
  }

  function _getCurrentWindow() {
    return _iframeEl.contentWindow;
  }

  function _isIframeLoaded() {
    return _iframeEl && _iframeEl.dataset.isLoaded;
  }

  function _createIframe() {
    var iframeEl = document.createElement('iframe');
    iframeEl.src = app.config.istorageIframeURL;
    iframeEl.className = CLASS_NAMES.iframe;

    return iframeEl;
  }

  function _callEventListeners(eventName, data) {
    _listeners[eventName] && _listeners[eventName].forEach(function(listener) {
      listener(data);
    });
  }

  function _processPostMessage(sourceWindow, data) {
    const payload = data.payload;

    switch(data.type) {
      case ACTION_TYPES.getRequest:
        _postMessage(
          sourceWindow,
          {
            type: ACTION_TYPES.getResponse,
            payload: {
              value: _localStorage.getItem(payload.key),
              requestID: payload.requestID,
            }
          }
        );
        break;

      case ACTION_TYPES.setRequest:
        _localStorage.setItem(payload.key, payload.value);
        _postMessage(
          sourceWindow,
          {
            type: ACTION_TYPES.setResponse,
            payload: {
              key: payload.key,
              value: payload.value,
              requestID: payload.requestID,
            }
          }
        );
        break;

      case ACTION_TYPES.setResponse:
        _callRequestCallback(payload.requestID, {
          key: payload.key,
          value: payload.value,
          source: sourceWindow,
        });
        break;

      case ACTION_TYPES.getResponse:
        _callRequestCallback(
          payload.requestID,
          payload.value,
          sourceWindow
        );
        break;

      case ACTION_TYPES.triggerRequest:
        _localStorage.setItem(
          payload.eventName,
          JSON.stringify({
            data: payload.data,
            requestID: payload.requestID,
          })
        );
        _localStorage.removeItem(payload.eventName);
        break;

      case ACTION_TYPES.triggerResponse:
        _callEventListeners(payload.eventName, payload.data);
        _callRequestCallback(payload.requestID);
        break;
    }
  }

  function _parseJSON(data) {
    let parsedData;

    try { parsedData = JSON.parse(data); }
    catch(error) { return; }

    return parsedData;
  }

  function _onMessage(event) {
    const parsedData = _parseJSON(event.data);

    parsedData && _processPostMessage(event.source, parsedData);
  }

  function _onStorage(event) {
    if (!event.newValue) { return; }

    const parsedNewValue = _parseJSON(event.newValue);

    _postMessage(
      window.parent,
      {
        type: ACTION_TYPES.triggerResponse,
        payload: {
          eventName: event.key,
          data: parsedNewValue && parsedNewValue.data,
          requestID: parsedNewValue && parsedNewValue.requestID,
        },
      }
    );
  }

  function _cacheRequest(callback) {
    _requests[++_requestID] = callback;
  }

  function _onSendMessage(data) {
    _cacheRequest(data.callback);

    _sendMessage({
      type: data.type,
      payload: Object.assign({}, data.payload, {requestID: _requestID}),
    });
  }

  function _getData(key, onGet) {
    _onSendMessage({
      type: ACTION_TYPES.getRequest,
      callback: onGet,
      payload: {key: key},
    });
  }

  function _setData(key, value, onSet) {
    _onSendMessage({
      type: ACTION_TYPES.setRequest,
      callback: onSet,
      payload: {
        key: key,
        value: value,
      },
    });
  }

  function _callRequestCallback(requestID, data, sourceWindow) {
    _requests[requestID] && _requests[requestID](data, sourceWindow);
    delete _requests[requestID];
  }

  function _triggerEventOnStorage(eventName, data, onAfterListen) {
    _onSendMessage({
      type: ACTION_TYPES.triggerRequest,
      callback: onAfterListen,
      payload: {
        eventName: eventName,
        data: data,
      },
    });
  }

  function _onTriggerEvent(key, callback) {
    if (_listeners[key]) {
      _listeners[key].push(callback);
    } else {
      _listeners[key] = [callback];
    }
  }

  function _removeEventListeners(eventName) {
    delete _listeners[eventName];
  }

  function _onListenIframeWindow() {
    window.addEventListener('storage', _onStorage);
  }

  function _init() {
    // если мы в iframe
    if (window.location !== window.parent.location) {
      window.addEventListener('load', _onListenIframeWindow);
    }

    try {
      localStorage.getItem('');
    } catch (error) {
      console.warn('Cross domain storage blocked, because "Block third-party cookies" is enable');

      _localStorage = {
        setItem: function() {},
        getItem: function() {},
        removeItem: function() {},
      };

      return;
    }

    _localStorage = localStorage;
  }

  function _listener() {
    window.addEventListener('message', _onMessage);
  }

  _init();
  _listener();

  return {
    get: _getData,
    set: _setData,
    trigger: _triggerEventOnStorage,
    on: _onTriggerEvent,
    removeEventListeners: _removeEventListeners,
  };
})();
