describe("visibility", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<a id='vis'></a>");

        link = DOM.find("#vis");
    });

    it("should use aria-hidden to toggle visibility", function() {
        expect(link.matches(":hidden")).toBe(false);
        link.hide();
        expect(link.get("aria-hidden")).toBe("true");
        link.show();
        expect(link.get("aria-hidden")).toBe("false");
    });

    it("should allow to toggle visibility", function() {
        expect(link.matches(":hidden")).toBe(false);
        expect(link.toggle().matches(":hidden")).toBe(true);
        expect(link.toggle().matches(":hidden")).toBe(false);
    });

    it("should accept optional visible argument", function() {
        expect(link.matches(":hidden")).toBe(false);
        expect(link.toggle(true).matches(":hidden")).toBe(false);
        expect(link.toggle(false).matches(":hidden")).toBe(true);
    });

    it("should handle unknown aria-hidden values as false", function() {
        expect(link.matches(":hidden")).toBe(false);
        link.set("aria-hidden", "123");
        expect(link.matches(":hidden")).toBe(false);
        link.toggle();
        expect(link.matches(":hidden")).toBe(true);
    });
});