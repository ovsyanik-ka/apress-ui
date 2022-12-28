(function () {
  function _loadMainModules(eventName) {
    var moduleLoader = function () {
      for (var item in app.modules) {
        if (!app.modules[item][eventName]) {
          continue;
        }

        try {
          if (app.modules[item].initiated) {
            return;
          }
          app.modules[item][eventName]();
          app.modules[item].initiated = true;
        } catch (error) {
          console.trace(error);
        }
      }
    };

    setTimeout(moduleLoader, 10);
  }

  function _onWindowLoad() {
    if (app.config.authIsComplete) {
      app.config.authIsComplete.then(_loadMainModules.bind(null, 'load'));
    } else {
      _loadMainModules('load');
    }
  }

  function _listener() {
    document.addEventListener(
      'DOMContentLoaded',
      _loadMainModules.bind(null, 'ready')
    );
    window.addEventListener('load', _onWindowLoad);
  }

  app.modules && _listener();
})();
