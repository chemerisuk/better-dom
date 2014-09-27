suite("create", function () {
    "use strict";

    benchmark("jquery#create(String)", function() {
        jQuery("<a>");
    });

    benchmark("DOM#create(String)", function() {
        DOM.create("a");
    });

    benchmark("jquery#create(Element)", function() {
        jQuery(document.createElement("a"));
    });

    benchmark("DOM.constructor(Element)", function() {
        DOM.constructor(document.createElement("a"));
    });

    benchmark("jquery#create(HtmlString) with vars", function() {
        jQuery("<a>", {id: "a1", rel: "b2"}).append("<span>").append("<i>");
    });

    benchmark("jquery#create(HtmlString) without vars", function() {
        jQuery("<a id='a1' rel='b2'><span></span><i></i></a>");
    });

    benchmark("DOM#create(HtmlString)", function() {
        DOM.create("<a id='a1' rel='b2'><span></span><i></i></a>");
    });

    benchmark("DOM#create(EmmetString) with vars", function() {
        DOM.create("a#{0}[rel={1}]>span+i", ["a1", "b2"]);
    });

    benchmark("DOM#create(EmmetString) without vars", function() {
        DOM.create("a#a1[rel=b2]>span+i");
    });

    benchmark("native complex create", function() {
        var link = document.createElement("a");

        link.id = "a1";
        link.rel = "b2";
    });

});