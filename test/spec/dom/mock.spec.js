describe("DOM.mock", function() {
    "use strict";

    it("should return instance of DOMElement", function() {
        var el = DOM.mock();

        expect(el).toBeDefined();
        expect(el).toBeEmpty();
    });

    it("should populate instance with extension methods", function() {
        var method = function() {},
            field = new Date(),
            el;

        DOM.extend(".mock", { method: method, field: field });

        el = DOM.mock("<div class=\"mock\"></div>");

        expect(el.method).toBe(method);
        expect(el.field).toBe(field);
    });

    it("should populate complex trees", function() {
        var method = function() {},
            field = new Date(),
            el;

        DOM.extend(".mock1", { method: method });
        DOM.extend(".mock2", { field: field });

        el = DOM.mock("<div class=\"mock1\"><span class=\"mock2\"></span></div>");

        expect(el.method).toBe(method);
        expect(el.child(0).field).toBe(field);
    });

    it("should expose event handlers", function() {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime(), link;

        jasmine.sandbox.set("<a class=" + cls + "></a>");

        link = DOM.find("." + cls);

        DOM.extend("." + cls, {
            constructor: spy,
            onClick: function() {}
        });

        expect(typeof DOM.mock(DOM.format("<a class=\"{0}\"></a>", [cls])).onClick).toBe("function");
    });

    it("should ignore extension condition", function() {
        var el;

        DOM.extend(".mock3", false, { a: 7 });
        el = DOM.mock("<div class=\"mock3\"></div>");
        expect(el.a).toBe(7);

        DOM.extend(".mock4", function() { return false }, { b: 8 });
        el = DOM.mock("<div class=\"mock4\"></div>");
        expect(el.b).toBe(8);

        DOM.extend(".mock5", function() { return true }, { c: 9 });
        el = DOM.mock("<div class=\"mock5\"></div>");
        expect(el.c).toBe(9);
    });

    describe("mockAll", function() {
        it("should return arrays", function() {
            var links = DOM.mockAll("a");

            expect(Array.isArray(links)).toBeTruthy();
            expect(links[0]).toHaveTag("a");
        });
    });

    // it("should accept Emmet variables", function() {
    //     var el;

    //     DOM.extend(".mock6", function() { return true }, { d: 2 });
    //     el = DOM.mock("a.mock6[title={title}]", {title: "c"});
    //     expect(el.d).toBe(2);
    //     expect(el.get("title")).toBe("c");
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.mock(1); }).toThrow();
    });

});
