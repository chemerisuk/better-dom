describe("extend", function() {
    "use strict";
    
    var WAIT_FOR_WATCH_TIME = 50, 
        callback;

    beforeEach(function() {
        setFixtures("<div id='expr'></div><a class='extend'></a><span class='extend'></span><b class='extend'></b>");

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
        var step = 0;

        beforeEach(function() {
            DOM.find("#expr").append("<div class='expr" + step + "'></div>");
        });

        afterEach(function() {
            ++step;
        });

        // IE8 always put id and class attributes at the beginning of innerHTML string 
        // so in tests always put id before classes/attributes and classes before attributes
        // also IE doesn't put empty value for unknown attributes so use only valid attributes

        it("should accept p+p",
            checkExpression("p+p", "<p></p><p></p>"));
        it("should accept p.name+p+p",
            checkExpression("p.name+p+p", "<p class=\"name\"></p><p></p><p></p>"));
        
        it("should accept p>em",
            checkExpression("p>em", "<p><em></em></p>"));
        it("should accept ul>li>a",
            checkExpression("ul>li>a", "<ul><li><a></a></li></ul>"));
        it("should accept p.hello>em.world>span",
            checkExpression("p.hello>em.world>span", "<p class=\"hello\"><em class=\"world\"><span></span></em></p>"));
        
        // classes

        it("should accept p.name",
            checkExpression("p.name", "<p class=\"name\"></p>"));
        it("should accept p.one.two.three",
            checkExpression("p.one.two.three", "<p class=\"one two three\"></p>"));
        it("should accept p.one.two-three",
            checkExpression("p.one.two-three", "<p class=\"one two-three\"></p>"));
        
        // id

        it("should accept p#myid",
            checkExpression("p#myid", "<p id=\"myid\"></p>"));
        it("should accept p#myid.name_with-dash32.otherclass",
            checkExpression("p#myid.name_with-dash32.otherclass", "<p id=\"myid\" class=\"name_with-dash32 otherclass\"></p>"));
        it("should accept span#three.one.two",
            checkExpression("span#three.one.two", "<span id=\"three\" class=\"one two\"></span>"));
        
        // attributes

        it("should accept a[title]",
            checkExpression("a[title]", "<a title=\"\"></a>"));
        it("should accept a[title href]",
            checkExpression("a[title href]", "<a title=\"\" href=\"\"></a>"));
        it("should accept a.test[title href]",
            checkExpression("a.test[title href]", "<a class=\"test\" title=\"\" href=\"\"></a>"));
        it("should accept a.test[title href]",
            checkExpression("a.test[title href]", "<a class=\"test\" title=\"\" href=\"\"></a>"));
        it("should accept a#one.two[title href]",
            checkExpression("a#one.two[title href]", "<a id=\"one\" class=\"two\" title=\"\" href=\"\"></a>"));
        it("should accept a[title=hello]",
            checkExpression("a[title=hello]", "<a title=\"hello\"></a>"));
        it("should accept a[title=\"hello world\"]",
            checkExpression("a[title=\"hello world\"]", "<a title=\"hello world\"></a>"));
        it("should accept a[title='hello world']",
            checkExpression("a[title='hello world']", "<a title=\"hello world\"></a>"));
        it("should accept a[title='hello world' href=other]",
            checkExpression("a[title='hello world' href=other]", "<a title=\"hello world\" href=\"other\"></a>"));
        it("should accept a[title='hello world' href=other name]",
            checkExpression("a[title='hello world' href=other name]", "<a title=\"hello world\" href=\"other\" name=\"\"></a>"));
        it("should accept a[title='hello world' href=other name]>em",
            checkExpression("a[title='hello world' href=other name]>em", "<a title=\"hello world\" href=\"other\" name=\"\"><em></em></a>"));
        it("should accept section[id=javascript.files]",
            checkExpression("section[id=javascript.files]", "<section id=\"javascript.files\"></section>"));

        // counters

        it("should accept ul#nav>li.item$*3",
            checkExpression("ul#nav>li.item$*3", "<ul id=\"nav\"><li class=\"item1\"></li><li class=\"item2\"></li><li class=\"item3\"></li></ul>"));
        it("should accept ul>(li>b)*3",
            checkExpression("ul>(li>b)*3", "<ul><li><b></b></li><li><b></b></li><li><b></b></li></ul>"));
        it("should accept ul>li*3>b",
            checkExpression("ul>li*3>b", "<ul><li><b></b></li><li><b></b></li><li><b></b></li></ul>"));
        it("should accept ul#nav>li.pre$*3+li.post$*3",
            checkExpression("ul#nav>li.pre$*3+li.post$*3", "<ul id=\"nav\"><li class=\"pre1\"></li><li class=\"pre2\"></li><li class=\"pre3\"></li><li class=\"post1\"></li><li class=\"post2\"></li><li class=\"post3\"></li></ul>"));
        it("should accept .sample$*3",
            checkExpression(".sample$*3", "<div class=\"sample1\"></div><div class=\"sample2\"></div><div class=\"sample3\"></div>"));
        it("should accept li#id$.class$*3",
            checkExpression("li#id$.class$*3", "<li id=\"id1\" class=\"class1\"></li><li id=\"id2\" class=\"class2\"></li><li id=\"id3\" class=\"class3\"></li>"));

        // groups
        
        it("should accept div#head+(p>span)+div#footer",
            checkExpression("div#head+(p>span)+div#footer", "<div id=\"head\"></div><p><span></span></p><div id=\"footer\"></div>"));
        it("should accept div#head>((ul#nav>li*3)+(div.subnav>p)+(div.othernav))+div#footer",
            checkExpression("div#head>((ul#nav>li*3)+(div.subnav>p)+(div.othernav))+div#footer", "<div id=\"head\"><ul id=\"nav\"><li></li><li></li><li></li></ul><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div><div id=\"footer\"></div></div>"));
        it("should accept div#head>(ul#nav>li*3>(div.subnav>p)+(div.othernav))+div#footer",
            checkExpression("div#head>(ul#nav>li*3>(div.subnav>p)+(div.othernav))+div#footer", "<div id=\"head\"><ul id=\"nav\"><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li></ul><div id=\"footer\"></div></div>"));
        it("should accept ul>li.pre$*2+(li.item$*4>a)+li.post$*2",
            checkExpression("ul>li.pre$*2+(li.item$*4>a)+li.post$*2", "<ul><li class=\"pre1\"></li><li class=\"pre2\"></li><li class=\"item1\"><a></a></li><li class=\"item2\"><a></a></li><li class=\"item3\"><a></a></li><li class=\"item4\"><a></a></li><li class=\"post1\"></li><li class=\"post2\"></li></ul>"));
        it("should accept div>(i+b)*2+(span+em)*3",
            checkExpression("div>(i+b)*2+(span+em)*3", "<div><i></i><b></b><i></i><b></b><span></span><em></em><span></span><em></em><span></span><em></em></div>"));
        
        // group multiplication
        it("should accept (span.i$)*3",
            checkExpression("(span.i$)*3", "<span class=\"i1\"></span><span class=\"i2\"></span><span class=\"i3\"></span>"));
        // it("should accept (p.i$+ul>li.i$*2>span.s$)*3",
        //     checkExpression("(p.i$+ul>li.i$*2>span.s$)*3", "<p class=\"i1\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul><p class=\"i2\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul><p class=\"i3\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul>"));
        it("should accept p.p$*2>(i.i$+b.b$)*3",
            checkExpression("p.p$*2>(i.i$+b.b$)*3", "<p class=\"p1\"><i class=\"i1\"></i><b class=\"b1\"></b><i class=\"i2\"></i><b class=\"b2\"></b><i class=\"i3\"></i><b class=\"b3\"></b></p><p class=\"p2\"><i class=\"i1\"></i><b class=\"b1\"></b><i class=\"i2\"></i><b class=\"b2\"></b><i class=\"i3\"></i><b class=\"b3\"></b></p>"));
        

        // shortcuts
        // it("should accept input:checkbox",
        //     checkExpression("input:checkbox", "<input type=\"checkbox\"/>"));

        function normalizeHTML(str) {
            // convert string to lowercase, remove extra spaces and 
            // wrap attribute names with quotes because of IE
            return str.toLowerCase().replace(/>\s+</g,"><").replace(/([\w\-]+)=([\w\-.]+)([ >])/g, function(str, $n, $v, $e) {
                return $n + "=\"" + $v + "\"" + $e;
            });
        }
        function checkExpression(template, result) {
            return function() {
                callback.andCallFake(function() {
                    expect(normalizeHTML(this.get())).toBe(result);
                });

                DOM.extend(".expr" + step, { append: template }, { constructor: callback });

                waits(WAIT_FOR_WATCH_TIME);

                runs(function() {
                    expect(callback).toHaveBeenCalled();
                });
            };
        }
    });

});