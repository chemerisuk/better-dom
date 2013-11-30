(function() {
    "use strict";

    var nativeElements = Array.prototype.slice.call(document.all),
        jqueryElements = jQuery("*"),
        domElements = DOM.findAll("*"),
        i = 0, j = 0, k = 0, l = 0;

    suite("each", function () {
        benchmark("jquery#each", function() {
            jqueryElements.each(function() {
                ++i;
            });
        });

        benchmark("jquery.each", function() {
            jQuery.each(jqueryElements, function() {
                ++l;
            });
        });

        benchmark("DOM#each", function() {
            domElements.each(function() {
                ++j;
            });
        });

        benchmark("jquery#map", function() {
            jQuery.map(jqueryElements, function() {
                return new Date();
            });
        });

        benchmark("DOM#map", function() {
            domElements.map(function() {
                return new Date();
            });
        });

        benchmark("jquery#filter", function() {
            jqueryElements.filter(function(index) {
                return index % 2 === 0;
            });
        });

        benchmark("DOM#filter", function() {
            domElements.filter(function(el, index) {
                return index % 2 === 0;
            });
        });


        benchmark("native#each", function() {
            for (i = 0, k = nativeElements.length; i < k; ++i) {
                j = nativeElements[i];
            }
        });
    });
})();