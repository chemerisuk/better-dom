describe("visibility", function() {
    "use strict";

    var link;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='vis'>123</a>");

        link = DOM.find("#vis");
    });

    it("should use aria-hidden to toggle visibility", function() {
        expect(link.get("aria-hidden")).toBeFalsy();
        link.hide();
        expect(link.get("aria-hidden")).toBe("true");
        link.show();
        expect(link.get("aria-hidden")).toBe("false");
    });

    describe("hide", function() {
        it("should support optional delay argument", function() {
            var delay = 50,
                start = new Date();

            expect(link.get("aria-hidden")).not.toBe("true");
            expect(link.hide(delay)).toBe(link);
            expect(link.get("aria-hidden")).not.toBe("true");

            waitsFor(function() {
                return link.get("aria-hidden") === "true" && (new Date() - start) >= delay;
            });
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.hide("123") }).toThrow();
            expect(function() { link.hide(function() { }) }).toThrow();
            expect(function() { link.hide(-10) }).toThrow();
            expect(function() { link.hide(true) }).toThrow();
        });
    });

    describe("show", function() {
        it("show should support optional delay argument", function() {
            var delay = 50,
                start = new Date();

            link.hide();
            expect(link.get("aria-hidden")).toBe("true");
            expect(link.show(delay)).toBe(link);
            expect(link.get("aria-hidden")).toBe("true");

            waitsFor(function() {
                return link.get("aria-hidden") !== "true" && (new Date() - start) >= delay;
            });
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.show("123") }).toThrow();
            expect(function() { link.show(function() { }) }).toThrow();
            expect(function() { link.show(-10) }).toThrow();
            expect(function() { link.show(true) }).toThrow();
        });
    });

    describe("toggle", function() {
        it("should allow to toggle visibility", function() {
            expect(link.get("aria-hidden")).toBeFalsy();
            expect(link.toggle().matches(":hidden")).toBe(true);
            expect(link.toggle().matches(":hidden")).toBe(false);
        });

        it("should accept optional visible boolean argument", function() {
            expect(link.get("aria-hidden")).toBeFalsy();
            expect(link.toggle(true).matches(":hidden")).toBe(false);
            expect(link.toggle(false).matches(":hidden")).toBe(true);
        });

        it("should accept optional visible functor", function() {
            var links = DOM.create("a*3>{444}");

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

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.toggle("123") }).toThrow();
            expect(function() { link.toggle(10) }).toThrow();
            expect(function() { link.toggle(-10) }).toThrow();
            expect(function() { link.toggle({}) }).toThrow();
        });
    });

    it("should handle unknown aria-hidden values as false", function() {
        expect(link.matches(":hidden")).toBe(false);
        link.set("aria-hidden", "123");
        expect(link.matches(":hidden")).toBe(false);
        link.toggle();
        expect(link.matches(":hidden")).toBe(true);
    });
});