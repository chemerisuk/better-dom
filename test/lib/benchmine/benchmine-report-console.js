// Console reporter
// ================
// Reporter that only prints to console.

;(function (window, undefined) {

  // I18n strings.
  var i18n = {
    start:    'Suite started...',
    cycle:    'Run benchmark: {0}',
    error:    'Error on benchmark: {0} ({1})',
    abort:    'Suite aborted!',
    reset:    'Suite reset!',
    fastests: 'Fastest benchmark(s): {0}',
    slowests: 'Slowest benchmark(s): {0}'
  };

  // API shortcuts.
  var getEnv       = Benchmine.getEnv;
  var formatNumber = Benchmine.formatNumber;
  var formatString = Benchmine.formatString;

  // ---------------------------------------------------------------------------

  // Console reporter constructor.
  var ConsoleReporter = function () {
  };

  // Called to initialize the reporter.
  ConsoleReporter.prototype.init = function (suite) {
  };

  // Called when the suite starts running.
  ConsoleReporter.prototype.onStart = function (event, bench) {
     log(i18n.start);
  };

  // Called between running benchmarks.
  ConsoleReporter.prototype.onCycle = function (event, bench) {
    // If the benchmark errored, ignore.
    if (bench.error != null) {
      return;
    }

    log(i18n.cycle, bench);
  };

  // Called when a test throws an error.
  ConsoleReporter.prototype.onError = function (event, bench) {
    log(i18n.error, bench.name, bench.error);
  };

  // Called when the suite is aborted.
  ConsoleReporter.prototype.onAbort = function (event, bench) {
    log(i18n.abort);
  };

  // Called when the suite is reset.
  ConsoleReporter.prototype.onReset = function (event, bench) {
    log(i18n.reset);
  };

  // Called when the suite completes running.
  ConsoleReporter.prototype.onComplete = function (event, bench) {
    var suite = this;
    var fastests = suite.filter('fastest').pluck('name');
    var slowests = suite.filter('slowest').pluck('name');

    log(i18n.fastests, fastests);
    log(i18n.slowests, slowests);
  };

  Benchmine.ConsoleReporter = ConsoleReporter;

  // ---------------------------------------------------------------------------

  // Logs a message to the console.
  function log() {
    console.log(formatString.apply(formatString, arguments));
  }

  // ---------------------------------------------------------------------------

}(this));
