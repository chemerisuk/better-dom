suite("DOMElement.addClass", function () {
    "use strict";

    var nativeSandbox = document.getElementById("sandbox"),
        jquerySandbox = jQuery("#sandbox"),
        domSandbox = DOM.find("#sandbox");

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
});