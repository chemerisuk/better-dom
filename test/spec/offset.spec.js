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

    it("should have width and height calculated based on offset", function() {
        var offset = link.offset();

        expect(link.width()).toBe(Math.floor(offset.right - offset.left));
        expect(link.height()).toBe(Math.floor(offset.bottom - offset.top));
    });

    it("should not change offsets when window is scrolling", function() {
        var offset = normalize(link.offset());

        window.scrollTo(0, window.outerHeight);

        expect(normalize(link.offset())).toEqual(offset);
    });

    function normalize(offset) {
        var result = {};

        _forIn(offset, function(value, key) {
            result[key] = Math.floor(value);
        });

        return result;
    }

    function _forIn(obj, callback, thisPtr) {
        for (var prop in obj) {
            callback.call(thisPtr, obj[prop], prop, obj);
        }
    }

});