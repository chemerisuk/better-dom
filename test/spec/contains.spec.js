describe("contains", function() {
    var testEl;

    beforeEach(function() {
        setFixtures("<div id='test'><a></a><a></a></div>");

        testEl = DOM.find("#test");
    });

    it("should contain element's children", function() {
        expect(testEl.contains(testEl.find("a"))).toBeTruthy();
    });

    it("should accept native elements", function() {
        expect(testEl.contains(testEl.find("a")._node)).toBeTruthy();
    });

    it("should accept DOM collections", function() {
        expect(testEl.contains(testEl.findAll("a"))).toBeTruthy();
    });

    it("should throw error if the first argument is not a DOM or native node", function() {
        expect(function() { testEl.contains(2); }).toThrow();
    });

});