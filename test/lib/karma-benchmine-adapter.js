(function(window){
    "use strict";

    window.__karma__.start = function() {
        var benchmineEnv = window.Benchmine.getEnv();

        benchmineEnv.addReporter(new window.Benchmine.KarmaReporter());

        window.Benchmark.each(benchmineEnv.suites, function(suite) {
            suite.run({async: true});
        });
    };

}(window));
