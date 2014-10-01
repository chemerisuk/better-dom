describe("classes manipulation", function() {
    "use strict";

    var link;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='test' class='test test1'></a>");

        link = DOM.find("#test");
    });

    describe("hasClass", function() {
        it("should return 'true' if element has the class otherwise - 'false'", function() {
            expect(link.hasClass("test")).toBe(true);
            expect(link.hasClass("test2")).toBe(false);
        });

        it("should not accept multiple classes", function() {
            expect(link.hasClass("test", "test1")).toBe(true);
            expect(link.hasClass("test", "test2")).toBe(true);
        });

        it("should throw error if the first arg is not a string", function() {
            expect(function() { link.hasClass(1) }).toThrow();
            expect(function() { link.hasClass(function() {}) }).toThrow();
            expect(function() { link.hasClass(null) }).toThrow();
            expect(function() { link.hasClass({}) }).toThrow();
        });
    });

    describe("toggleClass", function() {
        it("should make appropriate changes with single class", function() {
            expect(link.toggleClass("test3")).toBe(true);
            expect(link).toHaveClass("test3");

            expect(link.toggleClass("test3")).toBe(false);
            expect(link).not.toHaveClass("test3");
        });

        it("should support optional argument force", function() {
            expect(link.toggleClass("test", true)).toBe(true);
            expect(link).toHaveClass("test");

            expect(link.toggleClass("test3", false)).toBe(false);
            expect(link).not.toHaveClass("test3");
        });
    });

    describe("addClass, removeClass", function() {
        it("should return reference to 'this'", function() {
            expect(link.addClass("test2")).toBe(link);
            expect(link.removeClass("test2")).toBe(link);
        });

        it("should make appropriate changes with single class", function() {
            expect(link.addClass("test2")).toHaveClass("test2");
            expect(link.removeClass("test2")).not.toHaveClass("test2");
        });

        it("should make appropriate changes with multiple classes", function() {
            link.addClass("test2", "test3");

            expect(link).toHaveClass("test2");
            expect(link).toHaveClass("test3");

            link.removeClass("test2", "test3");

            expect(link).not.toHaveClass("test2");
            expect(link).not.toHaveClass("test3");
        });

        it("should throw error if the first arg is not a string", function() {
            expect(function() { link.addClass(1) }).toThrow();
            expect(function() { link.addClass(function() {}) }).toThrow();
            expect(function() { link.addClass(null) }).toThrow();
            expect(function() { link.addClass({}) }).toThrow();

            expect(function() { link.removeClass(1) }).toThrow();
            expect(function() { link.removeClass(function() {}) }).toThrow();
            expect(function() { link.removeClass(null) }).toThrow();
            expect(function() { link.removeClass({}) }).toThrow();
        });
    });

    // it("should throw error if the first arg is not a string", function() {
    //     var strategies = ["addClass", "hasClass", "removeClass", "toHaveClass"],
    //         makeExpectation = function(strategy, arg) { return function() { link[strategy](arg) } },
    //         i, n, strategy;

    //     for (i = 0, n = strategies.length; i < n; ++i) {
    //         strategy = strategies[i];

    //         expect(makeExpectation(strategy, {})).toThrow();
    //         expect(makeExpectation(strategy, 1)).toThrow();
    //         expect(makeExpectation(strategy, null)).toThrow();
    //         expect(makeExpectation(strategy, undefined)).toThrow();
    //     }
    // });
});