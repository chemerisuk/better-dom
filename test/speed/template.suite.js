(function(){
    "use strict";

    suite("append", function () {
        benchmark("p.name+p+p", function() {
            DOM.parseTemplate("p.name+p+p");
        });

        benchmark("span[title=\"Hello world\" data=other attr2 attr3]>em", function() {
            DOM.parseTemplate("span[title=\"Hello world\" data=other attr2 attr3]>em");
        });

        benchmark("ul#nav>li.pre$*3+li.post$*3", function() {
            DOM.parseTemplate("ul#nav>li.pre$*3+li.post$*3");
        });

        benchmark("ul>li.pre$*2+(li.item$*4>a)+li.post$*2", function() {
            DOM.parseTemplate("ul>li.pre$*2+(li.item$*4>a)+li.post$*2");
        });

        benchmark("input:email#a.b", function() {
            DOM.parseTemplate("input:email#a.b");
        });
    });
}());

