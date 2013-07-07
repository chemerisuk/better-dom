describe("Node.bind", function() {
    "use strict";

    it("should bind arguments with method, save context, return value", function() {
        var link = DOM.create("a"),
            spy = jasmine.createSpy("test");

        link.test = spy.andReturn("x");
        link.bind("test", 1, link);

        expect(link.test()).toBe("x");
        expect(spy).toHaveBeenCalledWith(1, link);

        spy.andCallFake(function() {
            expect(this).toBe(link);
        });

        link.test.call(window);
        expect(spy.callCount).toBe(2);
    });

    it("should throw error if arguments are invalid", function() {
        var link = DOM.create("a");
        
        expect(function() { link.bind(); }).toThrow();
        expect(function() { link.bind(1); }).toThrow();
        expect(function() { link.test = 123; link.bind("test", 1); }).toThrow();
    });

});