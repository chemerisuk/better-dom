(function(){
    "use strict";

    var nativeSandbox = document.createElement("div"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.constructor(nativeSandbox)[0],
        className = "t" + new Date().getTime();

    document.body.appendChild(nativeSandbox);

    suite("toggleClass", function() {
        benchmark("jquery#toggleClass", function() {
            jquerySandbox.toggleClass(className);
        });

        benchmark("DOMElement#toggleClass", function() {
            domSandbox.toggleClass(className);
        });

        benchmark("native", function() {
            nativeSandbox.classList.toggle(className);
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());
