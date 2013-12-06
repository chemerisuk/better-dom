describe("clone", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<a id='link'><input id='input'></a>");

        link = DOM.find("#link");
    });

    it("should clone clildren by default", function() {
        var clone = link.clone(),
            child = clone.child(0);

        setFixtures(clone._node);

        expect(clone).not.toBe(link);
        expect(clone).toHaveTagEx("a");
        expect(clone).toHaveIdEx("link");

        expect(child).not.toBe(link.child(0));
        expect(child).toHaveTagEx("input");
        expect(child).toHaveIdEx("input");
    });

    it("should allow to do a shallow copy", function() {
        var clone = link.clone(false);

        expect(clone).not.toBe(link);
        expect(clone).toHaveTagEx("a");
        expect(clone).toHaveIdEx("link");

        expect(clone.children().length).toBe(0);
    });

    it("should throw error if argument is invalud", function() {
        expect(function() { link.clone(1) }).toThrow();
        expect(function() { link.clone({}) }).toThrow();
        expect(function() { link.clone(function() {}) }).toThrow();
        expect(function() { link.clone(null) }).toThrow();
        expect(function() { link.clone(undefined) }).toThrow();
    });

});