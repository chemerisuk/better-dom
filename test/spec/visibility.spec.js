describe("vesibility", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<a id='vis'></a>");

        link = DOM.find("#vis");
    });

    it("should allow to toggle visibility", function() {
        expect(link.isHidden()).toBe(false);
        expect(link.toggle().isHidden()).toBe(true);
        expect(link.toggle().isHidden()).toBe(false);
    });
});