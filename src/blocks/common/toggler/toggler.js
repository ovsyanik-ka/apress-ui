/*
 * Инструментарий для разворачивания/сворачивания контента.
 * Обязателен атрибут data-effect - эффект для скрытия/показа.
 * Используются ключевые классы:
 *   js-toggle-switcher - объект для переключения состояния, может иметь атрибут data-off с текстом для закрытого состояния;
 *   js-toggle-content - скрываемый/показываемый объект.
 * Необходимо соблюдать правильную вложенность.
 * Используется переменная глобальная $win
 */

;(function($) {
  var
    _options  = {},
    _defaults = {},
    // обработка текущего блока
    _create = function($block) {
      $block.filter(function() { return $(this).data('index') == null; }).each(function() {
        var
          $this  = $(this).data({
            options: $.extend({}, _options),
            index: $win.data('togglerCount')
          }),
          $switcher = $this.find('.js-toggle-switcher').filter(function() { return $(this).closest('.js-toggle').data('index') == $this.data('index'); }),
          $content = $this.find('.js-toggle-content').filter(function() { return $(this).closest('.js-toggle').data('index') == $this.data('index'); });

        $win.data('togglerCount', $win.data('togglerCount') + 1);
        $this.data({
          switcher: $switcher,
          content: $content
        });
        if ($this.hasClass('toggle-off') && $switcher.data('off')) {
          $switcher.data('on', $switcher.html()).html($switcher.data('off'));
        }

        $switcher.click(function(e) {
          var
            $this = $(this),
            $block = $this.closest('.js-toggle'),
            $content = $block.data('content'),
            state;

          state = $block.hasClass('toggle-off');
          $block.toggleClass('toggle-off');
          if ($this.data('off')) {
            if (state) {
              $this.data('on', $this.html()).html($this.data('off'));
            } else {
              $this.html($this.data('on'));
            }
          }

          switch ($block.data('effect')) {
            case 'slide':
              if (state) {
                $content.show().slideUp(200, function() { $win.resize(); });
              } else {
                $content.hide().slideDown(200, function() { $win.resize(); });
              }
              break;
            case 'fade':
              if (state) {
                $content.show().fadeOut(200, function() { $win.resize(); });
              } else {
                $content.hide().fadeIn(200, function() { $win.resize(); });
              }
              break;
            default:
          }

          e.preventDefault();
        });
      });
    },

    //методы плагина
    _methods = {
      //инициализация плагина
      init: function(options) {
        if (!$win.data('togglerCount')) {
          $win.data('togglerCount', 0);
        }
        $.extend(_options, _defaults, options);
        _create(this);
      }
    };

  $.fn.toggler = function(method) {
    // Логика вызова методов
    if (typeof method === 'object' || !method) {
      return _methods.init.apply(this, arguments);
    }
    if (_methods[method]) {
      return _methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    $.error('Метод ' +  method + ' не существует в jQuery.toggler');
  };
})(jQuery);