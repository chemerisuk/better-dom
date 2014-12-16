describe("find", function() {
    "use strict";

    it("should find an element by id", function() {
        jasmine.sandbox.set("<a id='test'>test</a>");
        expect(DOM.find("#test")).toHaveId("test");

        jasmine.sandbox.set("<a id='test'>test<span id='test1'></span></a>");
        expect(DOM.find("#test").find("#test1")).toHaveId("test1");

        jasmine.sandbox.set("<a id='test'>test</a><span id='test2'></span>");
        expect(DOM.find("#test").find("#test2")).toBeMock();
    });

    it("should find by id event if node was detached", function() {
        jasmine.sandbox.set("<a id='test'>test<span id='test1'></span></a>");

        var el = DOM.find("#test");

        expect(el.find("#test1")).toHaveId("test1");

        el.remove();

        expect(el.find("#test1")).toHaveId("test1");
    });

    it("should find an element by class", function() {
        jasmine.sandbox.set("<a class='test321'>test</a>");

        expect(DOM.find(".test321")).toHaveClass("test321");
    });

    it("should find an element by selector", function() {
        jasmine.sandbox.set("<div id=test><a data-attr='0'>test</a></div>");
        expect(DOM.find("#test").find("[data-attr='0']")).toHaveAttr("data-attr");


        jasmine.sandbox.set("<div id=test><a data-attr='1'>test</a></div>");
        expect(DOM.find("#test").find("[data-attr='1']")).toHaveAttr("data-attr");


        jasmine.sandbox.set("<div class=test><a data-attr='2'>test</a></div>");
        expect(DOM.find(".test").find("[data-attr='2']")).toHaveAttr("data-attr");

        // TODO: make a cotext bug fix test
    });

    it("should return at least empty element(s)", function() {
        var foo = DOM.find("foo");

        expect(foo.find("a")).toBeMock();
        expect(foo.findAll("a").length).toBe(0);
    });

    it("should fix querySelectorAll on element with context", function() {
        jasmine.sandbox.set("<div><p class='foo'><span></span></p></div>");

        var foo = DOM.find(".foo");

        expect(foo[0].querySelectorAll("div span").length).toBe(1);

        expect(foo.findAll("div span").length).toBe(0);
        expect(foo.get("id")).toBeFalsy();
    });

    it("should throw error if the first argument is not a string", function() {
        expect(function() { DOM.find(1); }).toThrow();
    });

    it("should not throw error if selector is not valid", function() {
        jasmine.clock().install();

        expect(function() { DOM.find("$test"); }).not.toThrow();

        jasmine.clock().uninstall();
    });

    it("might return empty results", function() {
        expect(DOM.findAll("details")).toEqual([]);
        expect(DOM.find("details")[0]).toBeUndefined();
    });

});