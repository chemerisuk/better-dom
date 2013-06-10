(function(){
    "use strict";

    var nativeSandbox = document.createElement("div"),
        jquerySandbox = jQuery(nativeSandbox),
        domSandbox = DOM.create(nativeSandbox);

    document.body.appendChild(nativeSandbox);

    suite("show/hide", function() {
        benchmark("jquery#hide()/show()", function() {
            jquerySandbox.hide();
            jquerySandbox.show();
        });

        benchmark("DOM#hide()/show()", function() {
            domSandbox.hide();
            domSandbox.show();
        });

        benchmark("native#hide()/show()", function() {
            nativeSandbox.style.display = "none";
            nativeSandbox.style.display = "block";
        });
    }, {
        onComplete: function() {
            document.body.removeChild(nativeSandbox);
        }
    });
}());
