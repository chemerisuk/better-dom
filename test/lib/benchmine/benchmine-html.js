// HTML tools
// ==========
// Basic tools for displaying the benchmarks.

;(function (window, undefined) {

  // I18n strings.
  var i18n = {
    suite: {
      run:     'Run all',
      abort:   'Stop running'
    }
  };

  // API shortcuts.
  var each   = Benchmark.each;
  var filter = Benchmark.filter;
  var getEnv = Benchmine.getEnv;

  // ---------------------------------------------------------------------------

  // Creates all the DOM elements necessary to display the benchmarks.
  Benchmine.Env.prototype.show = function () {
    var me = this;

    var container = getElement('div#benchmine');
    var banner = getElement('div#benchmine>div#banner.banner',
      // This will create the banner.
      createBanner(me)
    );

    // Retrieve the suites with at least one benchmark ...
    var suites = filter(me.getSuites(), function (suite) {
      return suite.length > 0;
    });
    // ... and display them.
    each(suites, function (suite) {
      var container = getElement(formatString('div#benchmine>div#suite_{0}.suite', suite.id),
        // This will create the table for the suite.
        createSuite(me, suite)
      );
      // Add listeners to modify the class of the container.
      suite
        .on('start',    function () { container.className = 'suite started';   })
        .on('abort',    function () { container.className = 'suite aborted';   })
        .on('complete', function () { container.className = 'suite completed'; });
    });

    return me;
  };

  // ---------------------------------------------------------------------------

  // Converts a number to a more readable comma-separated string representation.
  function formatNumber(number) {
    var digits = String(number).split('.');
    return digits[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') + (digits[1] ? '.' + digits[1] : '');
  }

  // Formats a string with the provided objects.
  function formatString(pattern) {
    var args = Array.prototype.slice.call(arguments, 1);
    return pattern.replace(/\{(\d+)\}/g, function (match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  }

  Benchmine.formatNumber = formatNumber;
  Benchmine.formatString = formatString;

  // ---------------------------------------------------------------------------

  // Creates a DOM element from the given template.
  function createElement(template) {
    var attrib, value, childTemplate, i, l;

    var elem = window.document.createElement(template.tagName);
    delete template.tagName;

    for (attrib in template) {
      value = template[attrib];
      if (typeof value === 'undefined') {
        continue;
      }
      switch (attrib) {
        case 'style':
          elem.style.cssText = value;
          break;
        case 'children':
          for (i = 0, l = value.length; i < l; i++) {
            childTemplate = value[i];
            elem.appendChild(createElement(childTemplate));
          }
          break;
        default:
          elem[attrib] = value;
      }
    }

    return elem;
  }

  // Empties a DOM element.
  function emptyElement(elem) {
    elem.innerHTML = '';

    return elem;
  }

  Benchmine.createElement = createElement;
  Benchmine.emptyElement  = emptyElement;

  // ---------------------------------------------------------------------------

  // Elements cache.
  var elements = {};

  // Gets an element based on the specified *Zen Coding*-like expression `str`:
  //
  // * If the element already exists, it just returns it.
  // * If the element does not exist, it creates it using the specified
  //   `creator` function.
  //
  // The element is cached by `id`.
  function getElement(str, creator) {
    // Use the default creator if none provided.
    creator || (creator = createGeneric);

    var tokens = str.split('>');
    var regex = /^([a-z]+)(#([0-9a-z_-]+))?(\.([0-9a-z_-]+))?$/i;

    return (function getElementRecursive(tokens) {
      var head = tokens.pop();
      // Extract tag, id and class from token.
      var match     = regex.exec(head);
      var tagName   = match[1];
      var id        = match[3];
      var className = match[5];

      // This element is cached.
      if (elements[id] != null) {
        return elements[id];
      }

      // This element isn't cached, but already exists in the DOM.
      elements[id] = window.document.getElementById(id);
      if (elements[id] != null) {
        return elements[id];
      }

      // This element isn't even in the DOM, so we have to create it.
      elements[id] = creator(tagName, id, className);

      if (tokens.length === 0) {
        // If this is the last element of the chain, append it to the body.
        window.document.body.appendChild(elements[id]);
      } else {
        // Otherwise, append it to its parent.
        getElementRecursive(tokens).appendChild(elements[id]);
      }

      return elements[id];
    }(tokens));
  }

  Benchmine.getElement = getElement;

  // ---------------------------------------------------------------------------

  // Creates an element with the specified attributes.
  function createGeneric(tagName, id, className) {
    return createElement({
      tagName:   tagName,
      id:        id,
      className: className
    });
  }

  // Creates the banner element at the top of the page.
  function createBanner(env) {
    return function (tagName, id, className) {
      return createElement({
        tagName:   tagName,
        id:        id,
        className: className,
        children:  [{
          tagName:   'div',
          className: 'logo',
          children:  [{
            tagName:     'span',
            className:   'title',
            innerHTML: 'Benchmark.js'
          }, {
            tagName:     'span',
            className:   'version',
            innerHTML: Benchmark.version
          }, {
            tagName:     'span',
            className:   'platform',
            innerHTML: '(' + Benchmark.platform + ')'
          }]
        }]
      });
    };
  }

  // Creates the table element for a suite.
  function createSuite(env, suite) {
    return function (tagName, id, className) {
      return createElement({
        tagName:   tagName,
        id:        id,
        className: className,
        children:  [{
          tagName:   'div',
          className: 'toolbar',
          children:  [{
            tagName:     'span',
            className:   'description',
            innerHTML: suite.name
          }, {
            tagName:     'a',
            className:   'run',
            href:        '#',
            innerHTML: i18n.suite.run,
            // Clicking this link runs the suite.
            onclick: function (evt) {
              suite.run({ async: true });
              return false;
            }
          }, {
            tagName:     'a',
            className:   'abort',
            href:        '#',
            innerHTML: i18n.suite.abort,
            // Clicking this other link aborts the suite.
            onclick: function (evt) {
              suite.abort();
              return false;
            }
          }]
        }]
      });
    };
  }

  // ---------------------------------------------------------------------------

}(this));
