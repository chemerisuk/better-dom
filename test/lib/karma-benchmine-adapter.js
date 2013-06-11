(function(window){
    "use strict";

    var tc = window.__karma__;

    tc.start = function() {
        var benchmineEnv = window.Benchmine.getEnv();

        benchmineEnv.addReporter(new window.Benchmine.KarmaReporter());

        window.Benchmark.each(benchmineEnv.suites, function(suite) {
            suite.run({async: true});
        });

        if (!benchmineEnv.suites.length) {
            tc.complete();
        }
    };

}(window));
