// Environment
// ===========
// Environment that contains all the suites specified by the user.

;(function (window, undefined) {

  // Benchmark environment.
  var env;

  // API shortcuts.
  var each   = Benchmark.each;
  var filter = Benchmark.filter;

  // ---------------------------------------------------------------------------

  var Benchmine = {};

  // Detect free variable `define`.
  var freeDefine = typeof define == 'function' && typeof define.amd == 'object' && define.amd && define;

  // Detect free variable `exports`.
  var freeExports = typeof exports == 'object' && exports &&
    (typeof global == 'object' && global && global == global.global && (window = global), exports);

  // Detect free variable `require`.
  var freeRequire = typeof require == 'function' && require;

  // Expose Benchmine...
  if (freeExports) {
    // ... in Node.js.
    if (typeof module == 'object' && module && module.exports == freeExports) {
      module.exports = Benchmine;
    }
    // ... in Narwhal or Ringo.
    else {
      freeExports.Benchmine = Benchmine;
    }
  }
  // ... via curl.js or RequireJS.
  else if (freeDefine) {
    freeDefine(['platform'], function (platform) {
      Benchmine.platform = platform;
      return Benchmine;
    });
  }
  // ... in a browser or Rhino.
  else {
    // Use square bracket notation so Closure Compiler won't munge `Benchmine`:
    // <http://code.google.com/closure/compiler/docs/api-tutorial3.html#export>
    window['Benchmine'] = Benchmine;
  }

  // ---------------------------------------------------------------------------

  // Environment constructor.
  var Env = function () {
    var me = this;

    me.currentSuite = null;
    me.suites = [];
  };

  // Clears this benchmark environment, removing all existing suites.
  Env.prototype.clear = function () {
    var me = this;

    me.currentSuite = null;
    me.suites = [];

    return me;
  };

  // Returns the suites for this benchmark environment.
  Env.prototype.getSuites = function () {
    var me = this;

    return me.suites;
  };

  // Adds a suite to the benchmark environment.
  Env.prototype.addSuite = function (name, defs, settings) {
    var me = this;

    // The current suite will be the parent of the new one.
    var parentSuite = me.currentSuite;

    // Create a new suite, ...
    var suiteOpts = settings;

    suiteOpts.nextSuite = me.suites.length + 1;
    suiteOpts.nextBenchmark = 1;
    suiteOpts.id   = String(suiteOpts.nextSuite);
    suiteOpts.name = (parentSuite == null ? '' : parentSuite.name + ' :: ') + name;
    var suite = new Benchmark.Suite(suiteOpts);
    // ... add it to the list of suites, ...
    me.suites.push(suite);
    // ... and make it the current one.
    me.currentSuite = suite;

    // Execute its definitions.
    if (defs != null) {
      defs.call(suite);
    }

    // Restore the parent suite.
    me.currentSuite = parentSuite;

    return me;
  };

  // Adds a test to the current suite.
  Env.prototype.addBenchmark = function (name, fn) {
    var me = this;

    // If there isn't a current suite, fail.
    if (me.currentSuite == null) {
      throw 'Benchmark must be contained in a suite';
    }

    // Add a new benchmark to the current suite.
    var benchOpts = {
      id:   String(me.currentSuite.nextBenchmark++),
      name: name,
      fn:   fn
    };
    me.currentSuite.add(benchOpts);

    return me;
  };

  // Registers a reporter for all event types.
  Env.prototype.addReporter = function (reporter) {
    var me = this;

    // For each suite in the environment...
    each(me.suites, function (suite) {
      // ... init the reporter with the suite...
      reporter.init(suite);
      // ... and add all the necessary listeners.
      suite
        .on('start',    reporter.onStart)
        .on('cycle',    reporter.onCycle)
        .on('error',    reporter.onError)
        .on('abort',    reporter.onAbort)
        .on('reset',    reporter.onReset)
        .on('complete', reporter.onComplete);
    });

    return me;
  };

  Benchmine.Env = Env;

  // ---------------------------------------------------------------------------

  // Returns the benchmark environment.
  function getEnv() {
    env = env || new Benchmine.Env();

    return env;
  }

  Benchmine.getEnv = getEnv;

  // ---------------------------------------------------------------------------

  // Adds a suite to the benchmark environment.
  function suite(name, defs, settings) {
     getEnv().addSuite(name, defs, settings || {});
  }

  // Adds a test to the current suite.
  function benchmark(name, fn) {
    getEnv().addBenchmark(name, fn);
  }

  window['suite']     = suite;
  window['benchmark'] = benchmark;

  // ---------------------------------------------------------------------------

}(this));
