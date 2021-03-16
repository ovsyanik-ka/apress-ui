app.modules.initPhoneMask = (function(self) {
  var
    CONFIG = app.config.initPhoneMask,
    DEFAULT_CODE = CONFIG ? CONFIG.phoneCode : '+7',
    _default = {
      defaultPattern: CONFIG ? CONFIG.phonePattern : '+0 (000) 000-00-00',
      simplePattern: '+000000000000000',
      nationalPattern: '000000000000000',
      params: {
        placeholder: CONFIG ? CONFIG.phonePlaceholder : '+7 (___) ___-__-__',
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
      firstDigitMatch;

    if (~currentValue.indexOf(DEFAULT_CODE)) {
      pattern = 'defaultPattern';
    }
    else {
      firstDigitMatch = currentValue.match(/\d/);
      if (firstDigitMatch && firstDigitMatch[0] === '8') {
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
