describe("DOM.mock", function() {
    "use strict";

    it("should return instance of DOMElement", function() {
        var el = DOM.mock();

        expect(el).toBeDefined();
        expect(el).toBeMock();
    });

    it("should populate instance with extension methods", function() {
        var method = function() {},
            field = {a: "b"},
            el;

        DOM.extend(".mock", { method: method, field: field });

        el = DOM.mock("<div class=\"mock\"></div>");

        expect(el.method).toBe(method);
        expect(el.field).toEqual(field);
    });

    it("should populate complex trees", function() {
        var method = function() {},
            field = {a: "b"},
            el;

        DOM.extend(".mock1", { method: method });
        DOM.extend(".mock2", { field: field });

        el = DOM.mock("<div class=\"mock1\"><span class=\"mock2\"></span></div>");

        expect(el.method).toBe(method);
        expect(el.child(0).field).toEqual(field);
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

        expect(typeof DOM.mock("<a class=\"" + cls + "\"></a>").onClick).toBe("function");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.mock(1); }).toThrow();
    });

});
