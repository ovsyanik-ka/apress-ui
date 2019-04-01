// Модуль загрузки кнопок YaShare

app.modules.yandexShare = (function(self) {
  var
    _yaShareConfig = {
      theme: {
        lang: 'ru',
        services: app.config.yaShare.services || 'vkontakte,facebook,twitter,odnoklassniki,moimir,lj',
        size: app.config.yaShare.size || 's',
      }
    };

  function _initYaShare() {
    $('.js-ui-ya-share').each(function() {
      var id = $(this).attr('id');

      app.config.yaShare[id] && (_yaShareConfig.content = app.config.yaShare[id].content);

      Ya.share2(id, _yaShareConfig);
    })
  }


  self.load = function() {
    $.getScript('https://yastatic.net/share2/share.js')
      .done(function() {
        _initYaShare();
      });
  };

  return self;
})(app.modules.yandexShare || {});
