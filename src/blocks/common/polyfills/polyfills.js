// Element.prototype.append, Element.prototype.before
(function () {
  if (Element.prototype.append && Element.prototype.before) return;

  function _mutation(nodes) {
    // eslint-disable-line no-unused-vars
    if (!nodes.length) {
      throw new Error('DOM Exception 8');
    } else if (nodes.length === 1) {
      return typeof nodes[0] === 'string'
        ? document.createTextNode(nodes[0])
        : nodes[0];
    } else {
      var fragment = document.createDocumentFragment(),
        length = nodes.length,
        index = -1,
        node;

      while (++index < length) {
        node = nodes[index];

        fragment.appendChild(
          typeof node === 'string' ? document.createTextNode(node) : node
        );
      }

      return fragment;
    }
  }

  Document.prototype.append = Element.prototype.append = function append() {
    this.appendChild(_mutation(arguments));
  };

  Document.prototype.before = Element.prototype.before = function before() {
    if (this.parentNode) {
      this.parentNode.insertBefore(_mutation(arguments), this);
    }
  };
})();

// NodeList.prototype.forEach
(function () {
  if (NodeList.prototype.forEach) return;

  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
})();

// Object.values, Object.entries
(function () {
  if (Object.values && Object.entries) return;

  const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
  const isEnumerable = Function.bind.call(
    Function.call,
    Object.prototype.propertyIsEnumerable
  );
  const concat = Function.bind.call(Function.call, Array.prototype.concat);
  const keys = Reflect.ownKeys;

  Object.values = function values(O) {
    return reduce(
      keys(O),
      (v, k) =>
        concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []),
      []
    );
  };

  Object.entries = function entries(O) {
    return reduce(
      keys(O),
      (e, k) =>
        concat(
          e,
          typeof k === 'string' && isEnumerable(O, k) ? [[k, O[k]]] : []
        ),
      []
    );
  };
})();
