describe("offset", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<a id='test' href='#'>test</a>");

        link = DOM.find("#test");
    });

    it("should return object with valid properties", function() {
        var offset = link.offset();

        expect(offset).toBeDefined();
        expect(offset.left).toBeLessThan(offset.right);
        expect(offset.top).toBeLessThan(offset.bottom);
        expect(offset.width).toBe(offset.right - offset.left);
        expect(offset.height).toBe(offset.bottom - offset.top);
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