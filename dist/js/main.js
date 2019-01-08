"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Sidebar =
/*#__PURE__*/
function () {
  function Sidebar() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Sidebar);

    this.config = $.extend({
      // Collapsed class
      collapsedClass: 'is-collapsed',
      // Storage key
      storageKey: '_sassdoc_sidebar_index',
      // Index attribute
      indexAttribute: 'data-slug',
      // Toggle button
      toggleBtn: '.js-btn-toggle',
      // Automatic initialization
      init: true
    }, config);
    if (this.config.init === true) this.init();
  }

  _createClass(Sidebar, [{
    key: "init",
    value: function init() {
      this.config.nodes = $("[".concat(this.config.indexAttribute, "]"));
      this.load();
      this.updateDOM();
      this.bind();
      this.loadToggle();
    }
  }, {
    key: "loadToggle",
    value: function loadToggle() {
      $('<span />', {
        class: 'layout-toggle',
        html: '&times;',
        'data-alt': '&#8594;'
      }).appendTo($('.header'));
      var $toggle = $('.layout-toggle');
      $toggle.on('click', function (event) {
        var $this = $(event.target).closest($toggle);
        $('body').toggleClass('sidebar-closed');
        var alt = $this.html();
        $this.html($this.data('alt'));
        $this.data('alt', alt);
      });
    }
  }, {
    key: "load",
    value: function load() {
      var index = window.localStorage ? window.localStorage.getItem(this.config.storageKey) : null;
      this.index = index ? JSON.parse(index) : this.buildIndex();
    }
  }, {
    key: "buildIndex",
    value: function buildIndex() {
      var index = {};
      this.config.nodes.each($.proxy(function (i, item) {
        var $item = $(item);
        index[$item.attr(this.config.indexAttribute)] = !$item.hasClass(this.config.collapsedClass);
      }, this));
      return index;
    }
  }, {
    key: "updateDOM",
    value: function updateDOM() {
      for (var item in this.index) {
        if (this.index[item] === false) $("[".concat(this.config.indexAttribute, "=\"").concat(item, "\"]")).addClass(this.config.collapsedClass);
      }
    }
  }, {
    key: "save",
    value: function save() {
      if (!window.localStorage) return;
      window.localStorage.setItem(this.config.storageKey, JSON.stringify(this.index));
    }
  }, {
    key: "bind",
    value: function bind() {
      var _this = this;

      var collapsed = false; // Save index in localStorage

      window.onbeforeunload = $.proxy(function () {
        return _this.save();
      }, this); // Toggle all

      $(this.config.toggleBtn).on('click', $.proxy(function (event) {
        var $node = $(event.target);
        var text = $node.attr('data-alt');
        $node.attr('data-alt', $node.text());
        $node.text(text);
        var fn = collapsed === true ? 'removeClass' : 'addClass';

        _this.config.nodes.each($.proxy(function (index, item) {
          var $item = $(item);
          var slug = $item.attr(this.config.indexAttribute);
          this.index[slug] = collapsed;
          $("[".concat(this.config.indexAttribute, "=\"").concat(slug, "\"]"))[fn](this.config.collapsedClass);
        }, _this));

        collapsed = !collapsed;

        _this.save();
      }, this)); // Toggle item

      this.config.nodes.on('click', $.proxy(function (event) {
        var $item = $(event.target);
        var slug = $item.attr(_this.config.indexAttribute); // Update index

        _this.index[slug] = !_this.index[slug]; // Update DOM

        $item.toggleClass(_this.config.collapsedClass);
      }, this));
    }
  }]);

  return Sidebar;
}();

var Search =
/*#__PURE__*/
function () {
  function Search() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Search);

    this.config = $.extend({
      // Search DOM
      search: {
        items: '.sassdoc__item',
        input: '#js-search-input',
        form: '#js-search',
        suggestionsWrapper: '#js-search-suggestions'
      },
      // Fuse options
      fuse: {
        keys: ['name'],
        threshold: 0.3
      },
      init: true
    }, config);
    if (this.config.init === true) this.init();
  }

  _createClass(Search, [{
    key: "init",
    value: function init() {
      // Fuse engine instantiation
      this.index = new Fuse($.map($(this.config.search.items), function (item) {
        var $item = $(item);
        return {
          group: $item.attr('data-group'),
          name: $item.attr('data-name'),
          type: $item.attr('data-type'),
          node: $item
        };
      }), this.config.fuse);
      this.initSearch();
    }
  }, {
    key: "fillSuggestions",
    value: function fillSuggestions(items) {
      var searchSuggestions = $(this.config.search.suggestionsWrapper);
      searchSuggestions.html('');
      var suggestions = $.map(items.slice(0, 10), function (item) {
        var $li = $('<li />', {
          'data-group': item.group,
          'data-type': item.type,
          'data-name': item.name,
          'html': "<a href=\"#".concat(item.group, "-").concat(item.type, "-").concat(item.name, "\"><code>").concat(item.type.slice(0, 3), "</code>").concat(item.name, "</a>")
        });
        searchSuggestions.append($li);
        return $li;
      });
      return suggestions;
    }
  }, {
    key: "search",
    value: function search(term) {
      return this.fillSuggestions(this.index.search(term));
    }
  }, {
    key: "initSearch",
    value: function initSearch() {
      var searchForm = $(this.config.search.form);
      var searchInput = $(this.config.search.input);
      var searchSuggestions = $(this.config.search.suggestionsWrapper);
      var currentSelection = -1;
      var suggestions = [];
      var selected;
      var self = this; // Clicking on a suggestion

      searchSuggestions.on('click', function (e) {
        var target = $(event.target);

        if (target.nodeName === 'A') {
          searchInput.val(target.parent().data('name'));
          suggestions = self.fillSuggestions([]);
        }
      }); // Filling the form

      searchForm.on('keyup', function (e) {
        e.preventDefault(); // Enter

        if (e.keyCode === 13) {
          if (selected) {
            suggestions = self.fillSuggestions([]);
            searchInput.val(selected.data('name'));
            window.location = selected.children().first().attr('href');
          }

          e.stopPropagation();
        } // Down


        if (e.keyCode === 40) {
          currentSelection = (currentSelection + 1) % suggestions.length;
        } // Up


        if (e.keyCode === 38) {
          currentSelection = currentSelection - 1;
          if (currentSelection < 0) currentSelection = suggestions.length - 1;
        }

        if (suggestions[currentSelection]) {
          if (selected) selected.removeClass('selected');
          selected = suggestions[currentSelection];
          selected.addClass('selected');
        }
      });
      searchInput.on('keyup', function (e) {
        if (e.keyCode !== 40 && e.keyCode !== 38) {
          currentSelection = -1;
          suggestions = self.search($(searchInput).val());
        } else e.preventDefault();
      }).on('search', function () {
        suggestions = self.search($(searchInput).val());
      });
    }
  }]);

  return Search;
}();

var App =
/*#__PURE__*/
function () {
  function App() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, App);

    this.config = $.extend({
      // Search module
      search: new Search(),
      // Sidebar module
      sidebar: new Sidebar(),
      // Code preview helpers
      indentSpaces: true,
      indentSize: 2,
      indentUp: ['{', '('],
      indentDown: ['}', ')'],
      indentClass: 'js-autoindent',
      // Initialisation
      init: true
    }, config);

    this.__lastChar = function (string) {
      return string.trim()[string.trim().length - 1] || '';
    };

    this.__firstChar = function (string) {
      return string.trim()[0] || '';
    };

    if (this.config.init !== false) this.init();
  }

  _createClass(App, [{
    key: "init",
    value: function init() {
      this.codePreview();
    }
  }, {
    key: "autoIndent",
    value: function autoIndent(code) {
      var _this2 = this;

      code = code.split(/\r?\n/);
      var indentChar = this.config.indentSpaces ? ' '.repeat(this.config.indentSize) : "\t";
      var prevIndents = code[0].search(/\S/) / indentChar.length;
      var prevChar = code[0] ? this.__lastChar(code[0]) : '';
      var nextChar = code[1] ? this.__firstChar(code[1]) : '';
      return code.map(function (line, index, array) {
        var lineCode = line.trim();
        var currIndents = prevIndents;

        if (index !== 0) {
          if (_this2.config.indentUp.includes(prevChar)) ++currIndents;
          if (_this2.config.indentDown.includes(nextChar)) --currIndents;
        }

        var lineIndents = indentChar.repeat(currIndents);
        prevIndents = currIndents;
        prevChar = _this2.__lastChar(lineCode);
        nextChar = array[index + 1] ? _this2.__firstChar(array[index + 1]) : '';
        return "".concat(lineIndents).concat(lineCode);
      }, this).join("\n");
    }
  }, {
    key: "codePreview",
    value: function codePreview() {
      var _this3 = this;

      var $autos = $(".".concat(this.config.indentClass));
      var $toggle = $('.item__code--togglable');
      $autos.each(function (i, auto) {
        var $code = $(auto).is('code') ? $(auto) : $(auto).find('code');
        $code.html(_this3.autoIndent($code.html()));
      }).bind(this);
      $toggle.on('click', function () {
        var $item = $(event.target).closest($toggle);
        var $code = $item.find('code');
        var switchTo = $item.attr('data-current-state') === 'expanded' ? 'collapsed' : 'expanded';

        var code = _this3.autoIndent($item.attr("data-".concat(switchTo)));

        $item.attr('data-current-state', switchTo);
        $code.html(code);
        Prism.highlightElement($code[0]);
      });
    }
  }]);

  return App;
}();

var app = new App();
