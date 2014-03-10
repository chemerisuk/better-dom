try {
    DOM.importStyles("@keyframes fade", "from {opacity: 1} to {opacity: 0}");
} catch (e1) {
    try {
        DOM.importStyles("@-webkit-keyframes fade", "from {opacity: 1} to {opacity: 0}");
    } catch (e2) {
        // do nothing for IE
    }
}

DOM.importStyles(".fade", "opacity:1;transform:scale(1,1);-webkit-transform:scale(1,1)");
DOM.importStyles(".fade[aria-hidden=true]", "opacity:0;transform:scale(0,0);-webkit-transform:scale(0,0)");

describe("visibility", function() {
    "use strict";

    var link;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='vis'>123</a>");

        link = DOM.find("#vis");
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
            var spy = jasmine.createSpy();

            expect(link.hide(spy.and.callFake(done))).toBe(link);
        });

        it("should support exec callback when animation is defined", function(done) {
            var spy = jasmine.createSpy();

            link = DOM.create("a[style='animation:fade 10ms;-webkit-animation:fade 10ms;display:block']>{abc}");
            jasmine.sandbox.set(link);

            link.hide(spy);

            setTimeout(function() {
                expect(spy.calls.count()).toBe(1);

                done();
            }, 150);
        });

        it("should support exec callback when transition is defined", function(done) {
            var spy = jasmine.createSpy();

            link = DOM.create("a.fade[style='transition:opacity 10ms;-webkit-transition:opacity 10ms']>{abc}");
            jasmine.sandbox.set(link);

            link.hide(spy);

            setTimeout(function() {
                expect(spy.calls.count()).toBe(1);

                done();
            }, 150);
        });

        it("should work properly in legacy browsers", function(done) {
            var spy = jasmine.createSpy();

            link.style("transition-duration", "1");

            link.hide(spy.and.callFake(function() {
                link.style("animation-duration", "1");

                link.show(spy.and.callFake(function() {
                    link.style("transition-duration", null);

                    link.hide(spy.and.callFake(done));
                }));
            }));
        });

        it("should skip infinite animations", function(done) {
            var spy = jasmine.createSpy();

            link = DOM.create("a[style='animation:fade 10ms infinite;-webkit-animation:fade 10ms infinite;display:block']>{abc}");
            jasmine.sandbox.set(link);

            link.hide(spy);

            // expect(spy).not.toHaveBeenCalled();

            setTimeout(function() {
                expect(spy).toHaveBeenCalled();

                done();
            }, 50);
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.hide("123") }).toThrow();
            expect(function() { link.hide(-10) }).toThrow();
            expect(function() { link.hide(true) }).toThrow();
        });

        it("should respect ms and s suffixes for duration", function(done) {
            var link1 = DOM.create("a[style='animation:fade 0.1s;-webkit-animation:fade 0.1s;display:block']>{abc}"),
                link2 = DOM.create("a.fade[style='transition:opacity 10ms;-webkit-transition:opacity 10ms']>{abc}"),
                spy1 = jasmine.createSpy("animation"),
                spy2 = jasmine.createSpy("transition");

            jasmine.sandbox.set(link1);
            link1.after(link2);

            spy1.and.callFake(function() {
                expect(spy2).toHaveBeenCalled();

                done();
            });

            link1.hide(spy1);
            link2.hide(spy2);
        });

        it("should work for several transitions", function(done) {
            var start = Date.now();

            link = DOM.create("a.fade[style='transition:opacity 50ms, transform 100ms;-webkit-transition:opacity 10ms, -webkit-transform 200ms']>{abc}");

            jasmine.sandbox.set(link);

            link.hide(function() {
                expect(Date.now() - start).not.toBeLessThan(100);

                done();
            });
        });
    });

    describe("show", function() {
        it("should support optional delay argument", function(done) {
            var delay = 50, start = Date.now();

            link.hide(function() {
                expect(link).toHaveAttr("aria-hidden", "true");

                link.show(delay, function() {
                    expect(link).toHaveAttr("aria-hidden", "false");
                    expect(Date.now() - start).toBeGreaterThan(delay);

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