describe("contains", function() {
    "use strict";

    var testEl;

    beforeEach(function() {
        jasmine.sandbox.set("<div id='test'><a></a><a></a></div>");

        testEl = DOM.find("#test");
    });

    it("should accept a DOM element", function() {
        expect(testEl.contains(testEl.find("a"))).toBeTruthy();
    });

    // it("should accept DOM collections", function() {
    //     expect(testEl.contains(testEl.findAll("a"))).toBeTruthy();
    // });

    it("should return true for node itself", function() {
        expect(testEl.contains(testEl)).toBeTruthy();
    });

    it("should throw error if the first argument is not a DOM or native node", function() {
        expect(function() { testEl.contains(2); }).toThrow();
    });

});