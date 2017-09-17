// use this hack to prevent async errors from DOM.importStyles
jasmine.clock().install();

DOM.importStyles("@keyframes fade", "from {opacity: 1} to {opacity: 0}");
DOM.importStyles("@-webkit-keyframes fade", "from {opacity: 1} to {opacity: 0}");

jasmine.clock().uninstall();


DOM.importStyles(".hidden", "display:none");
DOM.importStyles(".invisible", "visibility:hidden");
DOM.importStyles(".fade", "opacity:1;transform:scale(1,1);-webkit-transform:scale(1,1)");
DOM.importStyles(".fade[aria-hidden=true]", "opacity:0;transform:scale(0,0);-webkit-transform:scale(0,0)");

describe("visibility", function() {
    "use strict";

    var link;

    beforeEach(function() {
        link = DOM.create("<a>123</a>");

        jasmine.sandbox.set(link);
    });

    describe("hide", function() {
        it("should support exec callback when no transition is defined", function(done) {
            expect(link.hide(done));
        });

        it("should support exec callback when animation is defined", function(done) {
            link.set("style", "animation:none 10ms;-webkit-animation:none 10ms;display:block");
            link.hide("fade", done);
        });

        it("should support exec callback when transition is defined", function(done) {
            link.addClass("fade").set("style", "transition:opacity 10ms;-webkit-transition:opacity 10ms");
            link.hide(done);
        });

        it("should work properly in legacy browsers", function(done) {
            link.css("transition-duration", "1");

            link.hide(function() {
                link.css("animation-duration", "1");

                link.show(function() {
                    link.css("transition-duration", null);

                    link.hide(done);
                });
            });
        });

        // it("by default updates display property", function(done) {
        //     expect(link.css("display")).not.toBe("none");

        //     link.hide(function() {
        //         expect(link.css("display")).toBe("none");

        //         done();
        //     });
        // });

        // it("should work for several transitions", function(done) {
        //     var start = Date.now();

        //     var link = DOM.create("<a class=\"fade\" style='transition:opacity 50ms, transform 100ms;-webkit-transition:opacity 50ms, -webkit-transform 100ms'>abc</a>");

        //     jasmine.sandbox.set(link);

        //     link.hide(function() {
        //         var delta = Date.now() - start;

        //         expect(delta < 50 || delta > 75).toBe(true);

        //         done();
        //     });
        // });

        it("should throw error if arguments are invalid", function() {
            // expect(function() { link.hide("123") }).toThrow();
            expect(function() { link.hide(-10) }).toThrow();
            // expect(function() { link.hide(true) }).toThrow();
        });

        it("supports force argument to change element display", function() {
            expect(link).not.toHaveStyle("display", "none");
            link.hide(true);
            expect(link).toHaveStyle("display", "none");
        });
    });

    describe("show", function() {
        it("should trigger callback for initially hidden elements", function(done) {
            link.addClass("hidden");

            link.show("fade", done);
        });

        it("should throw error if arguments are invalid", function() {
            // expect(function() { link.show("123") }).toThrow();
            expect(function() { link.show(-10) }).toThrow();
            // expect(function() { link.show(true) }).toThrow();
        });

        // it("should handle initially hidden element", function(done) {
        //     link.addClass("hidden");

        //     link.show(function() {
        //         expect(link.css("display")).not.toBe("none");
        //         expect(link).toHaveAttr("aria-hidden", "false");

        //         done();
        //     });
        // });

        it("should handle initially invisible element", function(done) {
            link.addClass("invisible");

            link.show(function() {
                expect(link.css("visibility")).not.toBe("hidden");
                expect(link).toHaveAttr("aria-hidden", "false");

                done();
            });
        });

        it("supports force argument to change element display", function() {
            link.css("display", "none");
            expect(link).toHaveStyle("display", "none");

            link.show(true);
            expect(link).not.toHaveStyle("display", "none");
        });
    });
});