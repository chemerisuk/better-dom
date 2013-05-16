suite("DOMElement.append", function () {
    "use strict";

    var nativeSandbox = document.getElementById("sandbox"),
        jquerySandbox = jQuery("#sandbox"),
        domSandbox = DOM.find("#sandbox");

    benchmark("jquery#append(String)", function() {
        jquerySandbox.append("<span>");
        nativeSandbox.innerHTML = "";
    });

    benchmark("jquery#append(Element)", function() {
        jquerySandbox.append(document.createElement("span"));
        nativeSandbox.innerHTML = "";
    });

    benchmark("DOM#append(String)", function() {
        domSandbox.append("<span>");
        nativeSandbox.innerHTML = "";
    });

    benchmark("DOM#append(Element)", function() {
        domSandbox.append(document.createElement("span"));
        nativeSandbox.innerHTML = "";
    });

    benchmark("native#appendChild(Element)", function() {
        nativeSandbox.appendChild(document.createElement("span"));
        nativeSandbox.innerHTML = "";
    });

});