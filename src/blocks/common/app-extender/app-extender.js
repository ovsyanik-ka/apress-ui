(function() {
  function _getConditionErrorMessagePairs(path, content) {
    return [
      [
        path[0] !== 'app',
        'app object should be targeted.'
      ],
      [
        !content,
        'content object should be passed as second argument.'
      ],
      [
        !Object.keys(content).length,
        'content should be a plain object with key-value pairs.'
      ]
    ];
  }

  function _checkErrors(path, content) {
    _getConditionErrorMessagePairs(path, content).forEach(function(pair) {
      _throwError(pair[0], pair[1]);
    });
  }

  function _throwError(condition, message) {
    if (!condition) { return; }

    throw new Error(message);
  }

  function _extendAppKey(pathToKey, content, isMergeSoft) {
    var path = pathToKey.split('.');

    _checkErrors(path, content);

    path.reduce(function(resultObj, currentScopeName, index) {
      if (!resultObj[currentScopeName]) { resultObj[currentScopeName] = {}; }

      if (index === path.length - 1) {
        resultObj[currentScopeName] = Object.keys(content).reduce(function(result, currentKey) {
          if (!result[currentKey] || !isMergeSoft) { result[currentKey] = content[currentKey]; }

          return result;
        }, resultObj[currentScopeName] || {});
      }

      return resultObj[currentScopeName];
    }, window);
  }

  function _extendApp() {
    var params = arguments;

    if (typeof params[0] === 'string') {
      _extendAppKey(params[0], params[1], params[2]);
    } else {
      Object.keys(params[0]).forEach(function(pathToKey) {
        _extendAppKey(pathToKey, params[0][pathToKey], params[1]);
      });
    }
  }

  app.utils.extendApp = _extendApp;
})();
