(function(){
    "use strict";

    var nativeSandbox = document.createElement("div"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.create(nativeSandbox);

    document.body.appendChild(nativeSandbox);

    suite("append", function () {
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

        benchmark("DOM#append(EmmetString)", function() {
            domSandbox.append("span");
            nativeSandbox.innerHTML = "";
        });

        benchmark("native#appendChild(Element)", function() {
            nativeSandbox.appendChild(document.createElement("span"));
            nativeSandbox.innerHTML = "";
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());

