// Table reporter
// ==============
// Reporter that creates a table with all the benchmarks for a suite.

;(function (window, undefined) {

  // I18n strings.
  var i18n = {
    table: {
      test:    'Test',
      hz:      'Ops/Sec'
    },
    status: {
      ready:   'Ready',
      pending: 'Pending...',
      error:   'Error'
    },
    bench: {
      hz:      '{0}',
      rme:     '±{0}%',
      fastest: 'Fastest',
      slowest: 'Slowest',
      slower:  '{0}% slower'
    }
  };

  // API shortcuts.
  var getEnv        = Benchmine.getEnv;
  var getElement    = Benchmine.getElement;
  var createElement = Benchmine.createElement;
  var emptyElement  = Benchmine.emptyElement;
  var formatNumber  = Benchmine.formatNumber;
  var formatString  = Benchmine.formatString;

  // ---------------------------------------------------------------------------

  // Table reporter constructor.
  var TableReporter = function () {
  };

  // Called to initialize the reporter.
  TableReporter.prototype.init = function (suite) {
    // Ignore empty suites.
    if (suite.length === 0) {
      return;
    }

    // Create the benchmarks table.
    var table = getElement(formatString('div#suite_{0}.suite>table#benchmarks_{0}.benchmarks', suite.id),
      createTable(suite)
    );
    // Create the log.
    var log = getElement(formatString('div#suite_{0}.suite>ul#log_{0}.log', suite.id));
  };

  // Called when the suite starts running.
  TableReporter.prototype.onStart = function (event) {
    var bench = event.target, suite = this;

    // Set each benchmark as pending.
    suite.forEach(function (bench) {
      setBenchmarkStatus(suite, bench, 'pending');
    });
  };

  // Called between running benchmarks.
  TableReporter.prototype.onCycle = function (event) {
    var bench = event.target, suite = this;

    // If the benchmark errored, ignore.
    if (bench.error != null) {
      return;
    }

    // Set the info for each benchmark.
    setBenchmarkInfo(suite, bench, {
      hz:  bench.hz,
      rme: bench.stats.rme
    });
  };

  // Called when a test throws an error.
  TableReporter.prototype.onError = function (event) {
    var bench = event.target, suite = this;

    // Set this benchmark as an error.
    setBenchmarkStatus(suite, bench, 'error');

    // Log the error.
    logError(suite, bench.error);
  };

  // Called when the suite is aborted.
  TableReporter.prototype.onAbort = function (event, bench) {
  };

  // Called when the suite is reset.
  TableReporter.prototype.onReset = function (event, bench) {
  };

  // Called when the suite completes running.
  TableReporter.prototype.onComplete = function (event, bench) {
    var suite = this;

    var benches  = suite.filter('successful');
    var fastests = suite.filter('fastest');
    var slowests = suite.filter('slowest');

    var fastest   = fastests[0];
    var reference = 100;
    if (fastest != null) {
      reference = fastest.hz;
    }

    // Set the info for each benchmark again (now with relative speed).
    benches.forEach(function (bench) {
      setBenchmarkInfo(suite, bench, {
        hz:      bench.hz,
        rme:     bench.stats.rme,
        rs:      1 - (bench.hz / reference),
        fastest: fastests.indexOf(bench) > -1,
        slowest: slowests.indexOf(bench) > -1
      });
    });
  };

  Benchmine.TableReporter = TableReporter;

  // ---------------------------------------------------------------------------

  // Creates a table for the suite.
  function createTable(suite) {
    return function (tagName, id, className) {
      // Create the table.
      var table = createElement({
        tagName:   tagName,
        id:        id,
        className: className
      });
      // Create the table head.
      var head = createElement({
        tagName:  'thead',
        children: [{
          tagName:  'tr',
          children: [{
            tagName:   'th'
          }, {
            tagName:   'th',
            scope:     'col',
            innerHTML: i18n.table.test
          }, {
            tagName:   'th',
            scope:     'col',
            innerHTML: i18n.table.hz
          }]
        }]
      });
      // Create the table body.
      var body = createElement({
        tagName: 'tbody'
      });

      // Append each bench to the table body.
      suite.forEach(function (bench) {
        var name = bench.name;
        var fn   = bench.fn.toString();
        var hz   = bench.hz;
        var rme  = bench.stats.rme;

        // Create an element for the bench...
        var row = createElement({
          tagName:  'tr',
          children: [{
            tagName:   'th',
            scope:     'row',
            innerHTML: name
          }, {
            tagName:  'td',
            children: [{
              tagName:   'pre',
              className: 'prettyprint',
              children:  [{
                tagName:   'code',
                className: 'language-javascript',
                innerHTML: fn
              }]
            }]
          }, {
            tagName:   'td',
            id:        formatString('benchmark_{0}_{1}', suite.id, bench.id),
            className: 'benchmark',
            innerHTML: i18n.status.ready
          }]
        });
        // ... and append it to the table body.
        body.appendChild(row);
      });

      // Compose the table.
      table.appendChild(head);
      table.appendChild(body);

      return table;
    };
  }

  // ---------------------------------------------------------------------------

  // Gets the element associated to the specified benchmark.
  function getBenchmark(suite, bench) {
    return getElement(formatString('td#benchmark_{0}_{1}', suite.id, bench.id));
  }

  // Sets the status of the benchmark at each execution.
  function setBenchmarkStatus(suite, bench, status, content) {
    var benchElem = getBenchmark(suite, bench);

    // No need to empty the element, because we are using innerHTML below.
    //emptyElement(benchElem);

    // Set the class and content.
    benchElem.className = status;
    benchElem.innerHTML = content != null ? content : i18n.status[status];
  }

  // Sets the info of the benchmark after finishing executing.
  function setBenchmarkInfo(suite, bench, info) {
    var elem = getBenchmark(suite, bench);

    // Empty the element.
    emptyElement(elem);

    // Create a document fragment.
    var fragment = document.createDocumentFragment();

    // Create an element with the ops/sec.
    if (info.hz != null) {
      var hz = formatNumber(info.hz.toFixed(info.hz < 100 ? 2 : 0));
      var hzElem = createElement({
        tagName:   'span',
        className: 'hz',
        innerHTML: formatString(i18n.bench.hz, hz)
      });
      fragment.appendChild(hzElem);
    }
    // Create an element with the relative margin of error.
    if (info.rme != null) {
      var rme = formatNumber(info.rme.toFixed(2));
      var rmeElem = createElement({
        tagName:   'span',
        className: 'rme',
        innerHTML: formatString(i18n.bench.rme, rme)
      });
      fragment.appendChild(rmeElem);
    }
    // Create an element with the relative speed.
    if (info.rs != null) {
      var rs = Math.round(info.rs * 100);
      var rsElem = createElement({
        tagName:   'span',
        className: 'rs',
        innerHTML: info.fastest ? i18n.bench.fastest : formatString(i18n.bench.slower, rs)
      });
      fragment.appendChild(rsElem);
    }

    // Set the class.
    elem.className = info.fastest ? 'fastest'
                   : info.slowest ? 'slowest'
                   : null;

    // Append the new info.
    elem.appendChild(fragment);
  }

  // Logs an error for the specified suite.
  function logError(suite, error) {
    var logElem = getElement(formatString('ul#log_{0}', suite.id));

    var errorElem = createElement({
      tagName:   'li',
      innerHTML: error
    });

    logElem.appendChild(errorElem);
  }

  // ---------------------------------------------------------------------------

}(this));
