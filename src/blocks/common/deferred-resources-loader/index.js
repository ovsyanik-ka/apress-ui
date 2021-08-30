(function() {
  if (window.apressImport) { return; }

  const loaders = {};

  function _initModules() {
    for(let key in app.modules) {
      const module = app.modules[key];
      !module.initiated && ['load', 'ready'].forEach((funName) => {
        if (module[funName]) {
          module.initiated = true;
          module[funName]();
        }
      });
    }
  }

  function _createScriptLoader(url) {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    script.async = false;
    document.body.appendChild(script);

    return new Promise((resolve) => {
      script.onload = () => { resolve(); };
    });
  }

  function _createStyleLoader(url) {
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    document.body.appendChild(link);

    return new Promise((resolve) => {
      link.onload = () => { resolve(); };
    });
  }

  function _getLoader(url) {
    if (!loaders[url]) {
      loaders[url] = url.includes('.js') ?
        _createScriptLoader(url) :
        _createStyleLoader(url);
    }

    return loaders[url];
  }

  function _getLoaders(urls) {
    urls = Array.isArray(urls) ? urls : [urls];
    return Promise.all(urls.map(_getLoader)).then(_initModules);
  }

  window.apressImport = _getLoaders;
})();
