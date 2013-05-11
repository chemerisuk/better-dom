describe("extend", function() {
    "use strict";
    
    var WAIT_FOR_WATCH_TIME = 50, 
        callback;

    beforeEach(function() {
        setFixtures("<div class='expr'></div><a class='extend'></a><span class='extend'></span><b class='extend'></b>");

        callback = jasmine.createSpy("callback");
    });

    it("should execute contructor property for each element", function() {
        DOM.extend(".extend", {
            constructor: callback
        });

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(3);
        });
    });

    it("should append optional template", function() {
        var template = {},
            checkStrategies = {
                prepend: "firstChild",
                append: "lastChild",
                after: "next",
                before: "prev"
            };

        for (var key in checkStrategies) {
            template[key] = "<i class='" + key + "'></i>";
        }

        DOM.extend(".extend", template, {});

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            DOM.findAll(".extend").each(function(domEl) {
                for (var key in checkStrategies) {
                    expect(domEl[checkStrategies[key]]("." + key)).toBeDefined();
                }
            });
        });
    });
    
    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
    });

    describe("template expressions", function() {
        it("should accept ul>li>a", 
            checkExpression("ul>li>a", "<ul><li><a></a></li></ul>"));

        it("should accept a+b+i", 
            checkExpression("a+b+i", "<a></a><b></b><i></i>"));

        it("should accept ul.cc>li", 
            checkExpression("ul.cc>li", "<ul class=\"cc\"><li></li></ul>"));

        it("should accept a#aa+b#bb", 
            checkExpression("a#aa+b#bb", "<a id=\"aa\"></a><b id=\"bb\"></b>"));

        it("should accept ul>li*3", 
            checkExpression("ul>li*3", "<ul><li></li><li></li><li></li></ul>"));

        it("should accept a[href]", 
            checkExpression("a[href]", "<a href=\"\"></a>"));

        it("should accept a[href='a']>span[title=\"t\"]", 
            checkExpression("a[href='a']>span[title=\"t\"]", "<a href=\"a\"><span title=\"t\"></span></a>"));

        it("should accept a[href=test]+b", 
            checkExpression("a[href=test]+b", "<a href=\"test\"></a><b></b>"));

        it("should accept (a*2+b)*2", 
            checkExpression("(a*2+b)*2", "<a></a><a></a><b></b><a></a><a></a><b></b>"));

        it("should accept a[data-i18n='test.key']",
            checkExpression("a[data-i18n='test.key']", "<a data-i18n=\"test.key\"></a>"));

        it("should accept a#x$*3",
            checkExpression("a#x$*3", "<a id=\"x0\"></a><a id=\"x1\"></a><a id=\"x2\"></a>"));

        it("should accept a.t$*3",
            checkExpression("a.t$*3", "<a class=\"t0\"></a><a class=\"t1\"></a><a class=\"t2\"></a>"));

        it("should accept complex",
            checkExpression("div.b>p.header+a.prev+a.next+table.days>(tr>th[data-i18n='c$']*3)+(tr>td*7)*2", 
                "<div class=\"b\"><p class=\"header\"></p><a class=\"prev\"></a><a class=\"next\"></a><table class=\"days\"><tr><th data-i18n=\"c0\"></th><th data-i18n=\"c1\"></th><th data-i18n=\"c2\"></th></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table></div>"));

        function normalizeHTML(str) {
            return str.toLowerCase().replace(/>\s+</g,"><").replace(/([\w\-]+)=([\w\-]+)([ >])/g, function(str, $n, $v, $e, offset, s) {
                return $n + "=\"" + $v + "\"" + $e;
            });
        }
        function checkExpression(template, result) {
            return function() {
                callback.andCallFake(function() {
                    expect(normalizeHTML(this.get())).toBe(result);

                    this.set("");
                });

                DOM.extend(".expr", { append: template }, { constructor: callback });

                waits(WAIT_FOR_WATCH_TIME);

                runs(function() {
                    expect(callback).toHaveBeenCalled();
                });
            };
        }
    });

});