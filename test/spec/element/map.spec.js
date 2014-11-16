describe("$Element#map", function() {
    var el;

    beforeEach(function() {
        el = DOM.create("a");
    });

    it("applies function and returns array", function() {
        var spy = jasmine.createSpy("spy"),
            result = el.map(spy.and.returnValue("bar"));

        expect(spy).toHaveBeenCalledWith(el);
        expect(result).toEqual(["bar"]);
    });

    it("supports optional argument context", function() {
        var context = {};

        el.map(function() {
            expect(this).toBe(context);
        }, context);
    });

    it("returns empty array for dummy nodes", function() {
        var spy = jasmine.createSpy("spy").and.returnValue("ok");

        expect(DOM.mock().map(spy)).toEqual([]);
        expect(DOM.find("foo").map(spy)).toEqual([]);

        expect(spy).not.toHaveBeenCalled();
    });

    it("throws error if the first argument is not a function", function() {
        expect(function() { el.map(1) }).toThrow();
        expect(function() { el.map({}) }).toThrow();
    })
});
