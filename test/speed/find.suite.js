suite("DOMElement.find", function () {
    "use strict";

    benchmark("jquery#selector", function() {
        jQuery("a");
    });

    benchmark("DOM#findAll", function() {
        DOM.findAll("a");
    });

    benchmark("DOM#find", function() {
        DOM.find("a");
    });

    benchmark("native", function() {
        document.getElementsByTagName("a");
    });

});