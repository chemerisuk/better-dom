describe("offset", function() {
    var link;

    beforeEach(function() {
        setFixtures("<a id='test' href='#'>test</a>");

        link = DOM.find("#test");
    });

    it("should return object with valid left, right, top, bottom properties", function() {
        var offset = link.offset();

        expect(offset).toBeDefined();
        expect(offset.left).toBeLessThan(offset.right);
        expect(offset.top).toBeLessThan(offset.bottom);
    });

    it("should not change offsets when window is scrolling", function() {
        var offset = link.offset();

        window.scrollTo(0, window.outerHeight);

        expect(link.offset()).toEqual(offset);
    });

});