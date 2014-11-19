describe("matches", function() {
    "use strict";

    var link, input;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='is1' href='#matches' class='test1'><i></i></a><input type='checkbox' id='is2' required checked>");

        link = DOM.find("#is1");
        input = DOM.find("#is2");
    });

    it("should match element by a simple selector", function() {
        expect(link.matches("a")).toBe(true);
        expect(link.matches("[href]")).toBe(true);
        expect(link.matches(".test1")).toBe(true);
        expect(link.matches("a.test1")).toBe(true);
        expect(link.matches("a[href]")).toBe(true);
        expect(link.matches("a#is1")).toBe(true);
        expect(link.matches("div")).toBe(false);

        expect(input.matches("[required]")).toBe(true);
        expect(input.matches("[unknown]")).toBe(false);
        expect(input.matches("[checked]")).toBe(true);
        expect(input.matches("[type=checkbox]")).toBe(true);
    });

    it("should match element by a complex selector", function() {
        expect(link.matches("a[href='#matches']")).toBe(true);
        expect(link.matches("div a")).toBe(true);
    });

    it("returns false for empty nodes", function() {
        expect(DOM.mock().matches("a")).toBe(false);
        expect(DOM.mock().matches("*")).toBe(false);
    });

    it("should throw error if the argument is ommited or not a string", function() {
        expect(function() { link.matches(); }).toThrow();
        expect(function() { link.matches(1); }).toThrow();
    });

    describe(":visible and :hidden", function() {
        it("should change depending on visibility", function(done) {
            expect(link.matches(":hidden")).toBe(false);
            expect(link.matches(":visible")).toBe(true);

            link.hide(function() {
                expect(link.matches(":hidden")).toBe(true);
                expect(link.matches(":visible")).toBe(false);

                link.show(function() {
                    expect(link.matches(":hidden")).toBe(false);
                    expect(link.matches(":visible")).toBe(true);

                    done();
                });
            });
        });

        // it("should respect aria-hidden attribute", function() {
        //     expect(link.matches(":hidden")).toBe(false);

        //     link.set("aria-hidden", "true");
        //     expect(link.matches(":hidden")).toBe(true);

        //     link.set("aria-hidden", "false");
        //     expect(link.matches(":hidden")).toBe(false);

        //     link.set("aria-hidden", null);
        //     expect(link.matches(":hidden")).toBe(false);
        // });

        it("should respect CSS property visibility", function() {
            expect(link.matches(":hidden")).toBe(false);

            link.css("visibility", "hidden");
            expect(link.matches(":hidden")).toBe(true);

            link.css("visibility", "visible");
            expect(link.matches(":hidden")).toBe(false);

            link.css("visibility", "inherit");
            expect(link.matches(":hidden")).toBe(false);
        });

        it("should respect CSS property display", function() {
            expect(link.matches(":hidden")).toBe(false);

            link.css("display", "none");
            expect(link.matches(":hidden")).toBe(true);

            link.css("display", "block");
            expect(link.matches(":hidden")).toBe(false);
        });

        // it("should respect availability in DOM", function() {
        //     expect(link.matches(":hidden")).toBe(false);

        //     link.remove();
        //     expect(link.matches(":hidden")).toBe(true);
        // });

        it("should support block elements as well", function(done) {
            link.css("display", "block");

            expect(link.matches(":hidden")).toBe(false);
            expect(link.matches(":visible")).toBe(true);

            link.hide(function() {
                expect(link.matches(":hidden")).toBe(true);
                expect(link.matches(":visible")).toBe(false);

                link.show(function() {
                    expect(link.matches(":hidden")).toBe(false);
                    expect(link.matches(":visible")).toBe(true);

                    done();
                });
            });
        });
    });
});
