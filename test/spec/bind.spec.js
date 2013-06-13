describe("Node.bind", function() {
    "use strict";

    it("should bind arguments with method and shouldn't change returning value", function() {
        var link = DOM.create("a"),
            spy = jasmine.createSpy("test");

        link.test = spy.andReturn("x");
        link.bind("test", 1, link);

        expect(link.test()).toBe("x");
        expect(spy).toHaveBeenCalledWith(1, link);
    });

    it("should return reference to this", function() {
        var link = DOM.create("a");

        link.test = function() {};

        expect(link.bind("test", 1)).toBe(link);
    });

    it("should throw error if arguments are invalid", function() {
        var link = DOM.create("a");
        
        expect(function() { link.bind(); }).toThrow();
        expect(function() { link.bind("test"); }).toThrow();
        expect(function() { link.bind("fire"); }).toThrow();
        expect(function() { link.bind(1); }).toThrow();
        expect(function() { link.test = 123; link.bind("test", 1); }).toThrow();
    });

});