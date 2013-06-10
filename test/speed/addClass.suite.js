(function(){
    "use strict";

    var nativeSandbox = document.createElement("div"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.create(nativeSandbox);

    document.body.appendChild(nativeSandbox);

    suite("addClass", function() {
        benchmark("jquery#addClass", function() {
            jquerySandbox.addClass("t" + new Date().getTime());
            nativeSandbox.className = "";
        });

        benchmark("DOMElement#addClass", function() {
            domSandbox.addClass("t" + new Date().getTime());
            nativeSandbox.className = "";
        });

        benchmark("native", function() {
            nativeSandbox.classList.add("t" + new Date().getTime());
            nativeSandbox.className = "";
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());
