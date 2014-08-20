(function(){
    "use strict";

    var nativeSandbox = document.createElement("a"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.constructor(nativeSandbox)[0];

    nativeSandbox.rel = "sandbox";
    document.body.appendChild(nativeSandbox);

    suite("setter", function () {
        benchmark("jquery#attr", function() {
            jquerySandbox.attr("rel", new Date().toString());
        });

        benchmark("jquery#prop", function() {
            jquerySandbox.prop("rel", new Date().toString());
        });

        benchmark("DOMElement.set", function() {
            domSandbox.set("rel", new Date().toString());
        });

        benchmark("native#setAttribute", function() {
            nativeSandbox.setAttribute("rel", new Date().toString());
        });

        benchmark("native#set", function() {
            nativeSandbox.rel = new Date().toString();
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());
