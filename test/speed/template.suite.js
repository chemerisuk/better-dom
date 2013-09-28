(function(){
    "use strict";

    suite("template", function () {
        benchmark("p.name+p+p", function() {
            DOM.template("p.name+p+p");
        });

        benchmark("span[title=\"Hello world\" data=other attr2 attr3]>em", function() {
            DOM.template("span[title=\"Hello world\" data=other attr2 attr3]>em");
        });

        benchmark("ul#nav>li.pre$*3+li.post$*3", function() {
            DOM.template("ul#nav>li.pre$*3+li.post$*3");
        });

        benchmark("ul>li.pre$*2+(li.item$*4>a)+li.post$*2", function() {
            DOM.template("ul>li.pre$*2+(li.item$*4>a)+li.post$*2");
        });

        benchmark("input:email#a.b", function() {
            DOM.template("input:email#a.b");
        });
    });
}());

