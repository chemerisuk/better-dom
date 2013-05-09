describe("offset", function() {
    "use strict";
    
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
        var offset = normalize(link.offset());

        window.scrollTo(0, window.outerHeight);

        expect(normalize(link.offset())).toEqual(offset);
    });

    function normalize(offset) {
        var result = {};

        for (var prop in offset) {
            result[prop] = Math.floor(offset[prop]);
        }

        return result;
    }

});