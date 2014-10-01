describe("DOM.noConflict", function() {
    "use strict";

    beforeEach(function() {
        this.currentDOM = window.DOM;
    });

    afterEach(function() {
        window.DOM = this.currentDOM;
    });

    it("should return to the previous state", function() {
        expect(this.currentDOM.noConflict()).toBe(this.currentDOM);
        expect(window.DOM).toBeUndefined();
    });

    it("should not touch changed state", function() {
        var otherDOM = {};

        window.DOM = otherDOM;

        expect(this.currentDOM.noConflict()).toBe(this.currentDOM);
        expect(window.DOM).toBe(otherDOM);
    });
});