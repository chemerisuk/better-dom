(function(){
    "use strict";

    var nativeSandbox = document.createElement("div"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.create(nativeSandbox);

    document.body.appendChild(nativeSandbox);

    suite("addClass", function() {
        benchmark("jquery#addClass", function() {
            jquerySandbox.addClass("a" + new Date().getTime());
            nativeSandbox.className = "";
        });

        benchmark("jquery#addClasses", function() {
            jquerySandbox.addClass("a" + new Date().getTime() + " b" + new Date().getTime() + " c" + new Date().getTime() + " d" + new Date().getTime());
            nativeSandbox.className = "";
        });

        benchmark("DOMElement#addClass", function() {
            domSandbox.addClass("a" + new Date().getTime());
            nativeSandbox.className = "";
        });

        benchmark("DOMElement#addClasses", function() {
            domSandbox.addClass("a" + new Date().getTime(), "b" + new Date().getTime(), "c" + new Date().getTime(), "d" + new Date().getTime());
            nativeSandbox.className = "";
        });

        benchmark("native#addClass", function() {
            nativeSandbox.classList.add("t" + new Date().getTime());
            nativeSandbox.className = "";
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());
