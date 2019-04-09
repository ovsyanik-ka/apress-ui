// Модуль для инициализации телефонной маски

app.modules.initPhoneMask = (function(self) {
  var
    DEFAULT_CODE = '+7',
    _default = {
      defaultPattern: '+0 (000) 000-00-00',
      simplePattern: '+000000000000000',
      nationalPattern: '000000000000000',
      params: {
        placeholder: DEFAULT_CODE + ' (___) ___-__-__',
        onKeyPress: function() {
          if (_options.onlyDefaultCode) {
            return;
          }

          _initPhoneMask.apply(null, arguments);
        }
      }
    },
    _options = {};

  function _initPhoneMask(currentValue, event, $field) {
    var
      pattern,
      firstDigitMatch,
      allowNational = $field.data('allow-national');

    if (~currentValue.indexOf(DEFAULT_CODE)) {
      pattern = 'defaultPattern';
    }
    else {
      firstDigitMatch = currentValue.match(/\d/);
      if (allowNational && firstDigitMatch && firstDigitMatch[0] === '8') {
        pattern = 'nationalPattern';
      }
      else {
        pattern = 'simplePattern';
      }
    }

    $field.mask(
      _options.onlyDefaultCode ? _options.defaultPattern.replace('+0', DEFAULT_CODE) :
        _options[pattern],
      _options.params
    );
  }

  function _init(element) {
    $(element || '.js-phone-mask').each(function() {
      var $this = $(this);

      $.extend(_options, _default, $this.data('phoneMaskOptions'));

      _initPhoneMask($this.val() || $this.text(), null, $this);
    });
  }

  function _listener() {
    $doc.on('init:phoneMask', function(event) { _init(event.target !== document && event.target); });
  }

  self.load = function() {
    _init();
    _listener();
  };

  return self;
})(app.modules.initPhoneMask || {});
