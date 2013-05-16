(function() {
    "use strict";

    var nativeElements = /*Array.prototype.slice.call(*/document.all,
        jqueryElements = jQuery("*"), 
        domElements = DOM.findAll("*"),
        i = 0, j = 0, k = 0;

    suite("DOMElement.each", function () {
        benchmark("jquery#each", function() {
            jqueryElements.each(function() {
                ++i;
            });
        });

        benchmark("DOM#each", function() {
            domElements.each(function() {
                ++j;
            });
        });

        benchmark("native#each", function() {
            for (i = 0, k = nativeElements.length; i < k; ++i) {
                j = nativeElements[i];
            }
        });

    });

})();