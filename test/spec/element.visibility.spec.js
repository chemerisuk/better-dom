var hasAnimationSupport = true;

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

DOM.importStyles(".fade", "opacity:1;transform:scale(1,1);-webkit-transform:scale(1,1)");
DOM.importStyles(".fade[aria-hidden=true]", "opacity:0;transform:scale(0,0);-webkit-transform:scale(0,0)");

describe("visibility", function() {
    "use strict";

    var link;

    beforeEach(function() {
        link = DOM.create("a>`123`");

        jasmine.sandbox.set(link);
    });

    it("should use aria-hidden to toggle visibility", function(done) {
        expect(link).not.toHaveAttr("aria-hidden");

        link.hide(function() {
            expect(link).toHaveAttr("aria-hidden", "true");

            link.show(function() {
                expect(link).toHaveAttr("aria-hidden", "false");

                done();
            });
        });
    });

    describe("hide", function() {
        it("should support optional delay argument", function(done) {
            var delay = 50, start = Date.now();

            expect(link).not.toHaveAttr("aria-hidden", "true");

            link.hide(delay, function() {
                expect(Date.now() - start).not.toBeLessThan(delay);
                expect(link).toHaveAttr("aria-hidden", "true");

                done();
            });
        });

        it("should support exec callback when no animation is defined", function(done) {
            expect(link.hide(done)).toBe(link);
        });

        it("should support exec callback when animation is defined", function(done) {
            link.style("cssText", "animation:fade 10ms;-webkit-animation:fade 10ms;display:block");
            link.hide(done);
        });

        it("should support exec callback when transition is defined", function(done) {
            link.addClass("fade").style("cssText", "transition:opacity 10ms;-webkit-transition:opacity 10ms");
            link.hide(done);
        });

        it("should work properly in legacy browsers", function(done) {
            link.style("transition-duration", "1");

            link.hide(function() {
                link.style("animation-duration", "1");

                link.show(function() {
                    link.style("transition-duration", null);

                    link.hide(done);
                });
            });
        });

        it("should skip infinite animations", function(done) {
            link.style("cssText", "animation:fade 10ms infinite;-webkit-animation:fade 10ms infinite;display:block");
            link.hide(done);
        });

        it("should respect ms and s suffixes for duration", function(done) {
            var otherLink = DOM.create("a.fade[style='transition:opacity 10ms;-webkit-transition:opacity 10ms']>`abc`"),
                spy = jasmine.createSpy("transition");

            link.style("cssText", "animation:fade 0.1s;-webkit-animation:fade 0.1s;display:block");
            link.after(otherLink);
            otherLink.hide(spy);

            link.hide(function() {
                expect(spy).toHaveBeenCalled();

                done();
            });
        });

        it("should work for several transitions", function(done) {
            var start = Date.now();

            link = DOM.create("a.fade[style='transition:opacity 50ms, transform 100ms;-webkit-transition:opacity 10ms, -webkit-transform 200ms']>`abc`");

            jasmine.sandbox.set(link);

            link.hide(function() {
                if (hasAnimationSupport) {
                    expect(Date.now() - start).not.toBeLessThan(100);
                }

                done();
            });
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.hide("123") }).toThrow();
            expect(function() { link.hide(-10) }).toThrow();
            expect(function() { link.hide(true) }).toThrow();
        });
    });

    describe("show", function() {
        it("should support optional delay argument", function(done) {
            var delay = 50, start = Date.now();

            link.hide(function() {
                expect(link).toHaveAttr("aria-hidden", "true");

                link.show(delay, function() {
                    expect(link).toHaveAttr("aria-hidden", "false");
                    expect(Date.now() - start).not.toBeLessThan(delay);

                    done();
                });
            });
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.show("123") }).toThrow();
            expect(function() { link.show(-10) }).toThrow();
            expect(function() { link.show(true) }).toThrow();
        });
    });

    describe("toggle", function() {
        it("should allow to toggle visibility", function(done) {
            expect(link).not.toHaveAttr("aria-hidden");

            link.toggle(function() {
                expect(link.matches(":hidden")).toBe(true);

                link.toggle(function() {
                    expect(link.matches(":hidden")).toBe(false);

                    done();
                });
            });
        });

        it("should work properly with show/hide combination", function(done) {
            expect(link).not.toHaveStyle("visibility", "hidden");

            link.toggle(function() {
                expect(link).toHaveStyle("visibility", "hidden");

                link.toggle(function() {
                    expect(link).toHaveStyle("visibility", "visible");

                    done();
                });
            });
        });
    });

    it("should handle unknown aria-hidden values as false", function() {
        expect(link.matches(":hidden")).toBe(false);
        link.set("aria-hidden", "123");
        expect(link.matches(":hidden")).toBe(false);
        link.toggle(function() {
            expect(link.matches(":hidden")).toBe(true);
        });
    });
});