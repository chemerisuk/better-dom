describe("vesibility", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<a id='vis'></a>");

        link = DOM.find("#vis");
    });

    it("should use aria-hidden to toggle visibility", function() {
        expect(link.isHidden()).toBe(false);
        link.hide();
        expect(link.get("aria-hidden")).toBe("true");
        link.show();
        expect(link.get("aria-hidden")).toBe("false");
    });

    it("should allow to toggle visibility", function() {
        expect(link.isHidden()).toBe(false);
        expect(link.toggle().isHidden()).toBe(true);
        expect(link.toggle().isHidden()).toBe(false);
    });
});