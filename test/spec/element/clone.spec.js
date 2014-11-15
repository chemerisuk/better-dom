describe("clone", function() {
    "use strict";

    var link;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='link'><input id='input'></a>");

        link = DOM.find("#link");
    });

    it("allows to clone all clildren", function() {
        var clone = link.clone(true),
            child = clone.child(0);

        jasmine.sandbox.set(clone);

        expect(clone).not.toBe(link);
        expect(clone).toHaveTag("a");
        expect(clone).toHaveId("link");

        expect(child).not.toBe(link.child(0));
        expect(child).toHaveTag("input");
        expect(child).toHaveId("input");
    });

    it("should allow to do a shallow copy", function() {
        var clone = link.clone(false);

        expect(clone).not.toBe(link);
        expect(clone).toHaveTag("a");
        expect(clone).toHaveId("link");

        expect(clone.children().length).toBe(0);
    });

    it("should work on empty elements", function() {
        var emptyEl = DOM.find("xxx");

        expect(emptyEl.clone()).toBeTruthy();
    });

    it("should throw error if argument is invalud", function() {
        expect(function() { link.clone(1) }).toThrow();
        expect(function() { link.clone({}) }).toThrow();
        expect(function() { link.clone(function() {}) }).toThrow();
        expect(function() { link.clone(null) }).toThrow();
        expect(function() { link.clone("abc") }).toThrow();
    });

});