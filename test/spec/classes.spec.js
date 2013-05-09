describe("classes manipulation", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<a id='test' class='test test1'></a>");

        link = DOM.find("#test");
    });

    describe("hasClass", function() {
        it("should return 'true' if element has the class otherwise - 'false'", function() {
            expect(link.hasClass("test")).toBe(true);
            expect(link.hasClass("test2")).toBe(false);
        });

        it("should accept space-separated class arrays", function() {
            expect(link.hasClass("test test1")).toBe(true);
            expect(link.hasClass("test test2")).toBe(false);
        });

    });

    describe("addClass, removeClass, toggleClass", function() {
        it("should return reference to 'this'", function() {
            expect(link.addClass("test2")).toBe(link);
            expect(link.removeClass("test2")).toBe(link);
            expect(link.toggleClass("test2")).toBe(link);
        });

        it("should make appropriate changes with single class", function() {
            expect(link.addClass("test2")._node).toHaveClass("test2");
            expect(link.removeClass("test2")._node).not.toHaveClass("test2");
            expect(link.toggleClass("test3")._node).toHaveClass("test3");
            expect(link.toggleClass("test3")._node).not.toHaveClass("test3");
        });

        it("should make appropriate changes with space-separated class arrays", function() {
            link.addClass("test2 test3");

            expect(link._node).toHaveClass("test2");
            expect(link._node).toHaveClass("test3");

            link.removeClass("test2 test3");

            expect(link._node).not.toHaveClass("test2");
            expect(link._node).not.toHaveClass("test3");

            link.toggleClass("test1 test4");

            expect(link._node).not.toHaveClass("test1");
            expect(link._node).toHaveClass("test4");
        });
    });
});