(function(){
    "use strict";

    var nativeSandbox = document.createElement("a"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.create(nativeSandbox);

    nativeSandbox.rel = "sandbox";
    document.body.appendChild(nativeSandbox);

    suite("getter", function () {
        benchmark("jquery#attr", function() {
            jquerySandbox.attr("id");
        });

        benchmark("jquery#prop", function() {
            jquerySandbox.prop("id");
        });

        benchmark("DOMElement.get", function() {
            domSandbox.get("id");
        });

        benchmark("native#getAttribute", function() {
            nativeSandbox.getAttribute("id");
        });

        benchmark("native#get", function() {
            nativeSandbox.id;
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());

