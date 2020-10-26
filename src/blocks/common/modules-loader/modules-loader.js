/**
 * Загрузчик js-модулей
 *
 */

(function() {
  function _loadMainModules(eventName) {
    var moduleLoader = function () {
      for (var item in app.modules) {
        if (!app.modules[item][eventName]) { continue; }

        try {
          if (app.modules[item].initiated) { return; }
          app.modules[item][eventName]();
          app.modules[item].initiated = true;
        } catch(error) {
          console.trace(error);
        }
      }
    };

    setTimeout(moduleLoader, 10);
  }

  function _onWindowLoad() {
    var deferred = app.config.crossDomainAuth && app.modules.crossDomainAuthBridge ?
      app.modules.crossDomainAuthBridge.authorizeUser() : $.Deferred().resolve();

    deferred.always(_loadMainModules.bind(null, 'load'));

    setTimeout(function() {
      deferred.resolve();
    }, 1000);
  }

  function _listener() {
    $doc.ready(_loadMainModules.bind(null, 'ready'));
    $win.load(_onWindowLoad);
  }

  app.modules && _listener();
})();
