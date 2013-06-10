(function (window, undefined) {
    "use strict";

    var tc = window.__karma__,
        total = 0, completed = 0;

    // Console reporter constructor.
    var KarmaReporter = function() { };

    // Called to initialize the reporter.
    KarmaReporter.prototype.init = function() {
        tc.info({ total: ++total });
    };

    // Called when the suite starts running.
    KarmaReporter.prototype.onStart = function() {
        //log("Suite \"" + this.name + "\" started...");
    };

    // Called between running benchmarks.
    KarmaReporter.prototype.onCycle = function() {
        // var target = event.target;

        // if (!target.error) {
        //     log(String(target));
        // }
    };

    // Called when a test throws an error.
    KarmaReporter.prototype.onError = function() {
        //log(i18n.error, bench.name, bench.error);
    };

    // Called when the suite is aborted.
    KarmaReporter.prototype.onAbort = function() {
        //log(i18n.abort);
    };

    // Called when the suite is reset.
    KarmaReporter.prototype.onReset = function() {
        //log(i18n.reset);
    };

    // Called when the suite completes running.
    KarmaReporter.prototype.onComplete = function() {
        log("Benchmarking \"" + this.name + "\"");

        this.forEach(function(target){
            log(">> " + String(target));
        });

        //log("Fastest is " + this.filter("fastest").pluck("name"));

        tc.result({
          description: this.name,
          suite: [this.name],
          success: ++completed,
          skipped: 0,
          time: this.reduce(calcTotalTime, 0),
          log: []
        });

        if (completed === total) {
            tc.complete();
        }
    };

    window.Benchmine.KarmaReporter = KarmaReporter;

    // ---------------------------------------------------------------------------

    // Logs a message to the console.
    function log(msg) {
        tc.info({dump: msg});
    }

    function calcTotalTime(time, benchmark) {
        return time + benchmark.times.elapsed * 1000;
    }

    // ---------------------------------------------------------------------------

}(this));
