describe("find", function() {
    "use strict";

    it("should find an element by id", function() {
        setFixtures("<a id='test'>test</a>");
        expect(DOM.find("#test")).toHaveIdEx("test");

        setFixtures("<a id='test'>test<span id='test1'></span></a>");
        expect(DOM.find("#test").find("#test1")).toHaveIdEx("test1");

        setFixtures("<a id='test'>test</a><span id='test2'></span>");
        expect(DOM.find("#test").find("#test2")).toBeEmptyEx();
    });

    it("should find by id event if node was detached", function() {
        setFixtures("<a id='test'>test<span id='test1'></span></a>");

        var el = DOM.find("#test");

        expect(el.find("#test1")).toHaveIdEx("test1");

        el.remove();

        expect(el.find("#test1")).toHaveIdEx("test1");
    });

    it("should find an element by class", function() {
        setFixtures("<a class='test321'>test</a>");

        expect(DOM.find(".test321")).toHaveClassEx("test321");
    });

    it("should find an element by selector", function() {
        setFixtures("<div id=test><a data-attr='0'>test</a></div>");
        expect(DOM.find("#test").find("[data-attr='0']")).toHaveAttrEx("data-attr");


        setFixtures("<div id=test><a data-attr='1'>test</a></div>");
        expect(DOM.find("#test").find("[data-attr='1']")).toHaveAttrEx("data-attr");


        setFixtures("<div class=test><a data-attr='2'>test</a></div>");
        expect(DOM.find(".test").find("[data-attr='2']")).toHaveAttrEx("data-attr");


        setFixtures("<div id=test><a data-attr2='2'></a></div><a data-attr1='1'></a><a data-attr3='3'></a>");
        expect(DOM.find("#test").find("> [data-attr2='2']")).toHaveAttrEx("data-attr2");
        expect(DOM.find("#test").find("+ [data-attr1='1']")).toHaveAttrEx("data-attr1");
        expect(DOM.find("#test").find("~ [data-attr3='3']")).toHaveAttrEx("data-attr3");

        // TODO: make a cotext bug fix test
    });

    it("should return at least empty element(s)", function() {
        var xxx = DOM.find("xxx");

        expect(xxx.find("a")).toBeEmptyEx();
        expect(xxx.findAll("a")).toBeEmptyEx();
    });

    it("should fix querySelectorAll on element with context", function() {
        setFixtures("<div><p class='foo'><span></span></p></div>");

        var foo = DOM.find(".foo");

        expect(foo._node.querySelectorAll("div span").length).toBe(1);
        expect(foo.findAll("div span").length).toBe(0);
        expect(foo.get("id")).toBeFalsy();
    });

    it("should throw error if the first argument is not a string", function() {
        expect(function() { DOM.find(1); }).toThrow();
    });

    it("should throw error if selector is not valid", function() {
        expect(function() { DOM.find("$test"); }).toThrow();
    });

});