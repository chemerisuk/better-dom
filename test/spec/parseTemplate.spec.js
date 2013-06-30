describe("DOM.parseTemplate", function() {
    "use strict";

    function checkExpr(source, target) {
        it(source, function() {
            expect(DOM.parseTemplate(source)).toBe(target);
        });
    }

    describe("'+' operator", function() {
        checkExpr("a", "<a></a>");
        checkExpr("p+p", "<p></p><p></p>");
        checkExpr("p.name+p+p", "<p class=\"name\"></p><p></p><p></p>");
    });

    describe("'>' operator", function() {
        checkExpr("p>em", "<p><em></em></p>");
        checkExpr("ul>li>a", "<ul><li><a></a></li></ul>");
        checkExpr("p.hello>em.world>span", "<p class=\"hello\"><em class=\"world\"><span></span></em></p>");
        checkExpr("a>b+i>span", "<a><b></b><i><span></span></i></a>");
    });

    describe("'^' operator", function() {
        // checkExpr("p>em^div", "<p><em></em></p><div></div>");
        // checkExpr("p>em>span^b", "<p><em><span></span></em><b></b></p>");
        // checkExpr("p>em>span^^div", "<p><em><span></span></em></p><div></div>");
        // checkExpr("p>em>span^^^^div", "<p><em><span></span></em></p><div></div>");
    });

    describe("classes", function() {
        checkExpr("p.name", "<p class=\"name\"></p>");
        checkExpr("p.one.two.three", "<p class=\"one two three\"></p>");
        checkExpr("p.one.two-three", "<p class=\"one two-three\"></p>");
    });
    
    describe("id", function() {
        checkExpr("p#myid", "<p id=\"myid\"></p>");
        checkExpr("p#myid.name_with-dash32.otherclass", "<p id=\"myid\" class=\"name_with-dash32 otherclass\"></p>");
        checkExpr("span#three.one.two", "<span id=\"three\" class=\"one two\"></span>");
    });

    describe("attributes", function() {
        checkExpr("a[title]", "<a title=\"\"></a>");
        checkExpr("a[title href]", "<a title=\"\" href=\"\"></a>");
        checkExpr("a.test[title href]", "<a class=\"test\" title=\"\" href=\"\"></a>");
        checkExpr("a.test[title href]", "<a class=\"test\" title=\"\" href=\"\"></a>");
        checkExpr("a#one.two[title href]", "<a id=\"one\" class=\"two\" title=\"\" href=\"\"></a>");
        checkExpr("a[title=hello]", "<a title=\"hello\"></a>");
        checkExpr("a[title=\"hello world\"]", "<a title=\"hello world\"></a>");
        checkExpr("a[title='hello world']", "<a title='hello world'></a>");
        checkExpr("a[title='hello world' href=other]", "<a title='hello world' href=\"other\"></a>");
        checkExpr("a[title='hello world' href=other name]", "<a title='hello world' href=\"other\" name=\"\"></a>");
        checkExpr("a[title='hello world' href=other name]>em", "<a title='hello world' href=\"other\" name=\"\"><em></em></a>");
        checkExpr("section[id=javascript.files]", "<section id=\"javascript.files\"></section>");
        checkExpr("a[b c='d\\'f']", "<a b=\"\" c='d\\'f'></a>");
    });

    describe("counters", function() {
        checkExpr("ul#nav>li.item$*3", "<ul id=\"nav\"><li class=\"item1\"></li><li class=\"item2\"></li><li class=\"item3\"></li></ul>");
        checkExpr("ul#nav>li.item$$$*3", "<ul id=\"nav\"><li class=\"item001\"></li><li class=\"item002\"></li><li class=\"item003\"></li></ul>");
        checkExpr("ul#nav>li.$$item$$$*3", "<ul id=\"nav\"><li class=\"01item001\"></li><li class=\"02item002\"></li><li class=\"03item003\"></li></ul>");
        checkExpr("ul#nav>li.pre$*3+li.post$*3", "<ul id=\"nav\"><li class=\"pre1\"></li><li class=\"pre2\"></li><li class=\"pre3\"></li><li class=\"post1\"></li><li class=\"post2\"></li><li class=\"post3\"></li></ul>");
        
        checkExpr("div.sample$*3", "<div class=\"sample1\"></div><div class=\"sample2\"></div><div class=\"sample3\"></div>");
        //checkExpr(".sample$*3", "<div class=\"sample1\"></div><div class=\"sample2\"></div><div class=\"sample3\"></div>");
        checkExpr("li#id$.class$*3", "<li id=\"id1\" class=\"class1\"></li><li id=\"id2\" class=\"class2\"></li><li id=\"id3\" class=\"class3\"></li>");

        checkExpr("{$@3 }*3", "3 4 5 ");
        checkExpr("{$@- }*3", "3 2 1 ");
        checkExpr("{$@-5 }*3", "7 6 5 ");
        
        checkExpr("ul>(li>b)*3", "<ul><li><b></b></li><li><b></b></li><li><b></b></li></ul>");
        checkExpr("ul>li*3>b", "<ul><li><b></b></li><li><b></b></li><li><b></b></li></ul>");
    });
    
    describe("groups", function() {
        checkExpr("div#head+(p>span)+div#footer", "<div id=\"head\"></div><p><span></span></p><div id=\"footer\"></div>");
        checkExpr("div#head>((ul#nav>li*3)+(div.subnav>p)+(div.othernav))+div#footer", "<div id=\"head\"><ul id=\"nav\"><li></li><li></li><li></li></ul><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div><div id=\"footer\"></div></div>");
        checkExpr("div#head>(ul#nav>li*3>(div.subnav>p)+(div.othernav))+div#footer", "<div id=\"head\"><ul id=\"nav\"><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li></ul><div id=\"footer\"></div></div>");
        checkExpr("ul>li.pre$*2+(li.item$*4>a)+li.post$*2", "<ul><li class=\"pre1\"></li><li class=\"pre2\"></li><li class=\"item1\"><a></a></li><li class=\"item2\"><a></a></li><li class=\"item3\"><a></a></li><li class=\"item4\"><a></a></li><li class=\"post1\"></li><li class=\"post2\"></li></ul>");
        checkExpr("div>(i+b)*2+(span+em)*3", "<div><i></i><b></b><i></i><b></b><span></span><em></em><span></span><em></em><span></span><em></em></div>");
        checkExpr("(span.i$)*3", "<span class=\"i1\"></span><span class=\"i2\"></span><span class=\"i3\"></span>");
        // checkExpr("(p.i$+ul>li.i$*2>span.s$)*3", "<p class=\"i1\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul><p class=\"i2\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul><p class=\"i3\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul>");
        checkExpr("p.p$*2>(i.i$+b.b$)*3", "<p class=\"p1\"><i class=\"i1\"></i><b class=\"b1\"></b><i class=\"i2\"></i><b class=\"b2\"></b><i class=\"i3\"></i><b class=\"b3\"></b></p><p class=\"p2\"><i class=\"i1\"></i><b class=\"b1\"></b><i class=\"i2\"></i><b class=\"b2\"></b><i class=\"i3\"></i><b class=\"b3\"></b></p>");
    });

    describe("type attribute", function() {
        // checkExpr("ul>.t>a", "<input type=\"radio\">");
        checkExpr("input:radio", "<input type=\"radio\">");
        checkExpr("input:email#a.b", "<input type=\"email\" id=\"a\" class=\"b\">");
        // checkExpr(":date", "<input type=\"date\">");
        // checkExpr("a>:date+b", "<a><input type=\"date\"><b></b></a>");
    });

    describe("text nodes", function() {
        checkExpr("span{Hello world}", "<span>Hello world</span>");
        checkExpr("span>{Hello world}", "<span>Hello world</span>");
        checkExpr("span>{Hello}+{ world}", "<span>Hello world</span>");
        checkExpr("span>{Click }+(a[href=/url/]>{here})+{ for more info}", "<span>Click <a href=\"/url/\">here</a> for more info</span>");
    });

    describe("implied tag names", function() {
        // checkExpr("#content", "<div id=\"content\"></div>");
        // checkExpr(".content", "<div class=\"content\"></div>");
        // checkExpr("ul>.item", "<ul><li class=\"item\"></li></ul>");
    });
});