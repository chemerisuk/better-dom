suite("DOMElement.set", function () {
    "use strict";

    var nativeLink = document.getElementById("test1"),
        jqueryLink = jQuery("#test2"),
        domLink = DOM.find("#test3");

    benchmark("jquery#attr", function() {
        jqueryLink.attr("id", new Date().toString());
    });

    benchmark("jquery#prop", function() {
        jqueryLink.prop("id", new Date().toString());
    });

    benchmark("DOMElement.set", function() {
        domLink.set("id", new Date().toString());
    });

    benchmark("native#setAttribute", function() {
        nativeLink.setAttribute("id", new Date().toString());
    });

    benchmark("native#set", function() {
        nativeLink.id = new Date().toString();
    });
});