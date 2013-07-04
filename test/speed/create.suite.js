suite("create", function () {
    "use strict";

    benchmark("jquery#create(String)", function() {
        jQuery("<a>");
    });

    benchmark("jquery#create(Element)", function() {
        jQuery(document.createElement("a"));
    });

    benchmark("jquery#create(HtmlString)", function() {
        jQuery("<a id='a1' rel='b2'><span></span><i></i></a>");
    });

    benchmark("jquery#create(Options)", function() {
        jQuery("<a>", {id: "a1", rel: "b2"}).append("<span>").append("<i>");
    });

    benchmark("DOM#create(String)", function() {
        DOM.create("a");
    });

    benchmark("DOM#create(Element)", function() {
        DOM.create(document.createElement("a"));
    });

    benchmark("DOM#create(HtmlString)", function() {
        DOM.create("<a id='a1' rel='b2'><span></span><i></i></a>");
    });

    benchmark("DOM#create(EmmetString)", function() {
        DOM.create("a#a1[rel=b2]>span+i");
    });

    benchmark("native(String)", function() {
        document.createElement("a");
    });

});