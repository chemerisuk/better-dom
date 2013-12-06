describe("DOM.mock", function() {
    "use strict";

    it("should return instance of DOMElement", function() {
        var el = DOM.mock();

        expect(el).toBeDefined();
        expect(el).toBeEmptyEx();
    });

    it("should populate instance with extension methods", function() {
        var method = function() {},
            field = new Date(),
            el;

        DOM.extend(".mock", { method: method, field: field });

        el = DOM.mock("div.mock");

        expect(el.method).toBe(method);
        expect(el.field).toBe(field);
    });

    it("should populate complex trees", function() {
        var method = function() {},
            field = new Date(),
            el;

        DOM.extend(".mock1", { method: method });
        DOM.extend(".mock2", { field: field });

        el = DOM.mock("div.mock1>span.mock2");

        expect(el.method).toBe(method);
        expect(el.child(0).field).toBe(field);
    });

    it("should expose event handlers", function() {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime(), link;

        setFixtures("<a class=" + cls + "></a>");

        link = DOM.find("." + cls);

        DOM.extend("." + cls, {
            constructor: spy,
            onClick: function() {}
        });

        expect(typeof DOM.mock("a." + cls).onClick).toBe("function");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.mock(1); }).toThrow();
    });

});
