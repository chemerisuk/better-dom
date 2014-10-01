describe("offset", function() {
    "use strict";

    var link;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='test' href='#'>test</a>");

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
        var normalize = function(offset) {
                var result = {};

                Object.keys(offset).forEach(function(key) {
                    result[key] = Math.floor(offset[key]);
                });

                return result;
            },
            offset = normalize(link.offset());

        window.scrollTo(0, window.outerHeight);

        expect(normalize(link.offset())).toEqual(offset);
    });

    it("should return mocked object for empty nodes", function() {
        expect(DOM.mock().offset()).toEqual({ top : 0, left : 0, right : 0, bottom : 0, width : 0, height : 0 });
    });
});
