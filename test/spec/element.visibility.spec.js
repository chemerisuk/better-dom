var userAgent = navigator.userAgent,
    hasAnimationSupport = !(~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0);

try {
    DOM.importStyles("@keyframes fade", "from {opacity: 1} to {opacity: 0}");
} catch (e1) {
    try {
        DOM.importStyles("@-webkit-keyframes fade", "from {opacity: 1} to {opacity: 0}");
    } catch (e2) {
        // do nothing for IE
        hasAnimationSupport = false;
    }
}

DOM.importStyles(".hidden", "display:none");
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

        // it("should skip infinite animations", function(done) {
        //     link.set("style", "animation:fade 10ms infinite;-webkit-animation:fade 10ms infinite;display:block");
        //     link.hide(done);
        // });

        // it("should respect ms and s suffixes for duration", function(done) {
        //     var otherLink = DOM.create("<a class=\"fade\" style='transition:opacity 10ms;-webkit-transition:opacity 10ms'>abc</a>"),
        //         spy = jasmine.createSpy("transition");

        //     link.set("style", "animation:fade 0.1s;-webkit-animation:fade 0.1s;display:block");
        //     link.after(otherLink);
        //     otherLink.hide(spy);

        //     link.hide(function() {
        //         expect(spy).toHaveBeenCalled();

        //         done();
        //     });
        // });

        it("should work for several transitions", function(done) {
            var start = Date.now();

            link = DOM.create("<a class=\"fade\" style='transition:opacity 50ms, transform 100ms;-webkit-transition:opacity 10ms, -webkit-transform 200ms'>abc</a>");

            jasmine.sandbox.set(link);

            link.hide(function() {
                if (hasAnimationSupport) {
                    expect(Date.now() - start).not.toBeLessThan(100);
                }

                done();
            });
        });

        it("should throw error if arguments are invalid", function() {
            // expect(function() { link.hide("123") }).toThrow();
            expect(function() { link.hide(-10) }).toThrow();
            expect(function() { link.hide(true) }).toThrow();
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
            expect(function() { link.show(true) }).toThrow();
        });

        it("should handle initially hidden element", function() {
            link.addClass("hidden");
            link.show();

            expect(link).toHaveAttr("aria-hidden", "false");
            expect(link.css("display")).not.toBe("none");
        });
    });

    describe("toggle", function() {
        beforeEach(function() {
            link = DOM.create("<a>123</a>");

            jasmine.sandbox.set(link);
        });

        it("should allow to toggle visibility", function(done) {
            expect(link.matches(":hidden")).toBe(false);

            link.toggle(function() {
                expect(link.matches(":hidden")).toBe(true);

                link.toggle(function() {
                    expect(link.matches(":hidden")).toBe(false);

                    done();
                });
            });
        });

        it("should work properly with show/hide combination", function(done) {
            expect(link).not.toHaveStyle("display", "none");

            link.toggle(function() {
                expect(link).toHaveStyle("display", "none");

                link.toggle(function() {
                    expect(link).not.toHaveStyle("display", "none");

                    done();
                });
            });
        });

        it("should toggle aria-hidden for detached elements", function(done) {
            link.remove();
            expect(link).not.toHaveAttr("aria-hidden");
            link.hide(function() {
                expect(link).toHaveAttr("aria-hidden", "true");

                link.show(function() {
                    expect(link).toHaveAttr("aria-hidden", "false");

                    done();
                });
            });
        });

        it("should update aria-hidden", function(done) {
            expect(link).not.toHaveAttr("aria-hidden");

            link.hide(function() {
                expect(link).toHaveAttr("aria-hidden", "true");

                link.show(function() {
                    expect(link).toHaveAttr("aria-hidden", "false");

                    done();
                });
            });
        });

        // it("should trigger callback only once", function(done) {
        //     var showSpy = jasmine.createSpy("show"),
        //         hideSpy = jasmine.createSpy("hide");

        //     link.set("style", "animation:none 10ms;-webkit-animation:none 10ms;display:block");
        //     link.toggle("fade", hideSpy);

        //     hideSpy.and.callFake(function() {
        //         link.toggle(showSpy);

        //         showSpy.and.callFake(function() {
        //             expect(hideSpy.calls.count()).toBe(1);
        //             expect(showSpy.calls.count()).toBe(1);

        //             done();
        //         });
        //     });
        // });
    });

    it("should handle unknown aria-hidden values as false", function(done) {
        expect(link.matches(":hidden")).toBe(false);
        link.set("aria-hidden", "123");
        expect(link.matches(":hidden")).toBe(false);
        link.toggle(function() {
            expect(link.matches(":hidden")).toBe(true);

            done();
        });
    });
});