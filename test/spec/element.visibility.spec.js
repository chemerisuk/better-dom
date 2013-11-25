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

    it("should accept optional visible boolean argument", function() {
        expect(link.matches(":hidden")).toBe(false);
        expect(link.toggle(true).matches(":hidden")).toBe(false);
        expect(link.toggle(false).matches(":hidden")).toBe(true);
    });

    it("should accept optional visible functor", function() {
        var links = DOM.create("a*3");

        DOM.find("body").append(links);

        links.each(function(el) {
            expect(el.matches(":hidden")).toBe(false);
        });

        links.toggle(function(el, index) {
            expect(el).toBe(links[index]);

            return false;
        });

        links.each(function(el) {
            expect(el.matches(":hidden")).toBe(true);
        });

        links.remove();
    });

    it("should handle unknown aria-hidden values as false", function() {
        expect(link.matches(":hidden")).toBe(false);
        link.set("aria-hidden", "123");
        expect(link.matches(":hidden")).toBe(false);
        link.toggle();
        expect(link.matches(":hidden")).toBe(true);
    });
});