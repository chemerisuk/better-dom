suite("DOMElement.toggleClass", function () {
    "use strict";

    var nativeSandbox = document.getElementById("sandbox"),
        jquerySandbox = jQuery("#sandbox"),
        domSandbox = DOM.find("#sandbox"),
        className = "t" + new Date().getTime();

    benchmark("jquery#toggleClass", function() {
        jquerySandbox.toggleClass(className);
    });

    benchmark("DOMElement#toggleClass", function() {
        domSandbox.toggleClass(className);
    });

    benchmark("native", function() {
        nativeSandbox.classList.toggle(className);
    });
});