suite("DOMElement.get", function () {
    "use strict";

    var nativeLink = document.getElementById("test1"),
        jqueryLink = jQuery("#test2"),
        domLink = DOM.find("#test3");

    benchmark("jquery#attr", function() {
        jqueryLink.attr("id");
    });

    benchmark("jquery#prop", function() {
        jqueryLink.prop("id");
    });

    benchmark("DOMElement.get", function() {
        domLink.get("id");
    });

    benchmark("native#getAttribute", function() {
        nativeLink.getAttribute("id");
    });

    benchmark("native#get", function() {
        nativeLink.id;
    });
});