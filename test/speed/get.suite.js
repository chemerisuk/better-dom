(function(){
    "use strict";

    var nativeSandbox = document.createElement("a"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.create(nativeSandbox);

    nativeSandbox.rel = "sandbox";
    document.body.appendChild(nativeSandbox);

    suite("getter", function () {
        benchmark("jquery#attr", function() {
            jquerySandbox.attr("rel");
        });

        benchmark("jquery#prop", function() {
            jquerySandbox.prop("rel");
        });

        benchmark("DOMElement.get", function() {
            domSandbox.get("rel");
        });

        benchmark("native#getAttribute", function() {
            nativeSandbox.getAttribute("rel");
        });

        benchmark("native#get", function() {
            nativeSandbox.rel;
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());
