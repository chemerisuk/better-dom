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

    try {
        DOM.importStyles("@keyframes show", "from {opacity: 1} to {opacity: 0}");
    } catch (e1) {
        try {
            DOM.importStyles("@-webkit-keyframes show", "from {opacity: 1} to {opacity: 0}");
        } catch (e2) {
            // do nothing for IE
        }
    }

    DOM.importStyles(".hide", "opacity:1");
    DOM.importStyles(".hide[aria-hidden=true]", "opacity:0");

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

        it("should support exec callback when no animation is defined", function() {
            var spy = jasmine.createSpy();

            link.hide(spy);

            expect(spy).not.toHaveBeenCalled();

            waitsFor(function() {
                return spy.callCount === 1;
            });
        });

        it("should support exec callback when animation is defined", function() {
            var spy = jasmine.createSpy();

            link = DOM.create("a[style='animation:show .1s;-webkit-animation:show .1s;display:block']>{abc}");
            jasmine.sandbox.set(link);

            link.hide(spy);

            expect(spy).not.toHaveBeenCalled();

            waitsFor(function() {
                return spy.callCount === 1;
            });
        });

        it("should support exec callback when transition is defined", function() {
            var spy = jasmine.createSpy();

            link = DOM.create("a.hide[style='transition:opacity 0.1s;-webkit-transition:opacity 0.1s']>{abc}");
            jasmine.sandbox.set(link);

            link.hide(spy);

            expect(spy).not.toHaveBeenCalled();

            waitsFor(function() {
                return spy.callCount === 1;
            });
        });

        it("should work properly in legacy browsers", function() {
            var spy = jasmine.createSpy();

            link.style("transition-duration", "1");
            link.hide(spy);

            link.style("animation-duration", "1");
            link.show(spy);

            link.style("transition-duration", null);
            link.hide(spy);

            waitsFor(function() {
                return spy.callCount === 3;
            });
        });

        it("should skip infinite animations", function() {
            var spy = jasmine.createSpy();

            link = DOM.create("a#inf[style='animation:show .1s infinite;-webkit-animation:show .1s infinite;display:block']>{abc}");
            jasmine.sandbox.set(link);

            link.hide(spy);

            expect(spy).not.toHaveBeenCalled();

            waitsFor(function() {
                return spy.callCount === 1;
            });
        });

        // it("should add pointer-events:none during animation", function() {
        //     var spy = jasmine.createSpy();

        //     spy.andCallFake(function() {
        //         expect(link.style("pointer-events")).not.toBe("none");
        //     });

        //     link = DOM.create("a#inf[style='animation:show .1s;-webkit-animation:show .1s;display:block']>{abc}");
        //     jasmine.sandbox.set(link);

        //     link.hide(spy);

        //     expect(link.style("pointer-events")).toBe("none");

        //     waitsFor(function() {
        //         return spy.callCount === 1;
        //     });
        // });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.hide("123") }).toThrow();
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

        it("should work properly with show/hide combination", function() {
            expect(link.style("display")).toBe("inline");

            link.toggle();

            expect(link.style("display")).toBe("none");

            link.toggle();

            expect(link.style("display")).toBe("inline");
        });

        // it("should accept optional visible boolean argument", function() {
        //     expect(link.get("aria-hidden")).toBeFalsy();
        //     expect(link.toggle(true).matches(":hidden")).toBe(false);
        //     expect(link.toggle(false).matches(":hidden")).toBe(true);
        // });

        // it("should accept optional visible functor", function() {
        //     var links = DOM.create("a*3>{444}");

        //     DOM.find("body").append(links);

        //     links.each(function(el) {
        //         expect(el.matches(":hidden")).toBe(false);
        //     });

        //     links.toggle(function(el, index) {
        //         expect(el).toBe(links[index]);

        //         return false;
        //     });

        //     links.each(function(el) {
        //         expect(el.matches(":hidden")).toBe(true);
        //     });

        //     links.remove();
        // });

        // it("should throw error if arguments are invalid", function() {
        //     expect(function() { link.toggle("123") }).toThrow();
        //     expect(function() { link.toggle(10) }).toThrow();
        //     expect(function() { link.toggle(-10) }).toThrow();
        //     expect(function() { link.toggle({}) }).toThrow();
        // });
    });

    it("should handle unknown aria-hidden values as false", function() {
        expect(link.matches(":hidden")).toBe(false);
        link.set("aria-hidden", "123");
        expect(link.matches(":hidden")).toBe(false);
        link.toggle();
        expect(link.matches(":hidden")).toBe(true);
    });
});