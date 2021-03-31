/*
* скрываем ссылки от индексации
*
*/
app.modules.spanToLinks = (function(self) {
  function _replace() {
    var $link = $('<a>');
    $('span[data-to]').each(function() {
      var
        $a = $link.clone(),
        self = this,
        attributes = self.attributes,
        parent = self.parentNode,
        child = $a[0];

      $(attributes).each(function(i) {
        var
          attrName = attributes[i].nodeName,
          attrValue = attributes[i].nodeValue;
        switch (attrName) {
          case 'data-alt':
            child.alt = attrValue;
            break;
          case 'data-title':
            child.title = attrValue;
            break;
          case 'data-to':
            child.href = attrValue;
            break;
          case 'data-target':
            child.target = attrValue;
            break;
          case 'data-text':
            child.innerHTML = attrValue;
            break;
          default:
            try {
              $a.attr(attrName, attrValue);
            } catch(e) {};
            break;
        }
      });
      if (this.innerHTML) {
        child.innerHTML = this.innerHTML;
      }
      parent.replaceChild(child, this);
    });

    document.dispatchEvent(new Event('load:spanToLinks'));
  }

  self.load = function() {
    _replace();
    document.addEventListener('spansToLinks', _replace);
  };

  return self;
})(app.modules.spanToLinks || {});
