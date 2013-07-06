suite("find/findAll", function () {
    "use strict";

    benchmark("jquery('a')", function() {
        jQuery("a");
    });

    benchmark("jquery('body div')", function() {
        jQuery("body div");
    });

    benchmark("DOM.findAll('a')", function() {
        DOM.findAll("a");
    });


    benchmark("DOM.findAll('body div')", function() {
        DOM.findAll("body div");
    });

    benchmark("DOM.find('a')", function() {
        DOM.find("a");
    });

    benchmark("DOM.find('body div')", function() {
        DOM.find("body div");
    });

    benchmark("getElementsByTagName('a')", function() {
        document.getElementsByTagName("a");
    });

    benchmark("querySelectorAll('body div')", function() {
        document.querySelectorAll("body div");
    });

    benchmark("querySelector('body div')", function() {
        document.querySelector("body div");
    });

});