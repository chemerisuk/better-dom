describe("extend", function() {
    "use strict";

    var WAIT_FOR_WATCH_TIME = 50,
        callback, randomClass;

    DOM.extend(".watch11", {
        constructor: function() {
            this.removeClass("watch11");
        }
    });

    DOM.extend(".watch12", {
        constructor: function() {
            this.removeClass("watch12");
        }
    });

    beforeEach(function() {
        callback = jasmine.createSpy("callback");
        randomClass = "ext" + Math.random().toString().split(".")[1];
    });

    it("should execute contructor for each element", function(done) {
        jasmine.sandbox.set("<a class='watch'></a><span class='watch'></span><b class='watch'></b>");

        callback.and.callFake(function() {
            expect(this).toBeDefined();
            expect(this.length).toBe(1);

            setTimeout(function() {
                if (callback.calls.count() === 3) done();
            }, 0);
        });

        DOM.extend(".watch", {
            constructor: callback
        });
    });

    // it("should not change interface if condition returns false", function() {
    //     var cls = "watchhh" + CLS_INDEX++,
    //         spy = jasmine.createSpy("ctr");

    //     spy.andReturn(false);

    //     jasmine.sandbox.set("<a class=" + cls + "></a>");

    //     DOM.extend("." + cls, false, {
    //         constructor: spy,
    //         method: function() {},
    //         onEvent: function() {}
    //     });

    //     waitsFor(function() {
    //         if (spy.calls.count() === 1) {
    //             var el = spy.calls[0].object;

    //             expect(el.method).toBeUndefined();
    //             expect(el.onEvent).toBeUndefined();

    //             return true;
    //         }
    //     });
    // });

    it("should capture any future element on page", function(done) {
        DOM.extend(".watch1", {constructor: callback});

        callback.and.callFake(function() {
            if (callback.calls.count() === 2) done();
        });

        jasmine.sandbox.set("<a class='watch1'></a><span class='watch1'></span>");
    });

    it("should not execute the same extension twice", function(done) {
        var link = DOM.create("a.ext1.ext2"),
            spy = jasmine.createSpy("ext2"),
            complete = function() {
                if (callback.calls.count() === 1 && spy.calls.count() === 1) {
                    link.remove();

                    done();
                }
            };

        DOM.find("body").append(link);

        DOM.extend(".ext1", {constructor: callback.and.callFake(complete)});
        DOM.extend(".ext2", {constructor: spy.and.callFake(complete)});
    });

    it("should accept several watchers of the same selector", function(done) {
        var spy = jasmine.createSpy("callback2"),
            complete = function() {
                if (callback.calls.count() === 2 && spy.calls.count() === 2) done();
            };

        jasmine.sandbox.set("<a class=" + randomClass + "></a><b class=" + randomClass + "></b>");

        DOM.extend("." + randomClass, {constructor: callback.and.callFake(complete)});
        DOM.extend("." + randomClass, {constructor: spy.and.callFake(complete)});
    });

    it("should accept different selectors for the same element", function(done) {
        var spy = jasmine.createSpy("callback2"),
            complete = function() {
                if (callback.calls.count() === 2 && spy.calls.count() === 1) done();
            };

        jasmine.sandbox.set("<a class=" + randomClass + "></a><b class=" + randomClass + "></b>");

        DOM.extend("." + randomClass, {constructor: callback.and.callFake(complete)});
        DOM.extend("b", {constructor: spy.and.callFake(complete)});
    });

    it("should accept different selectors for the same element before ready", function(done) {
        var el = DOM.create("div.watch11.watch12");

        DOM.ready(function() {
            jasmine.sandbox.set(el);
        });

        setTimeout(function() {
            expect(el.hasClass("watch11")).toBeFalsy();
            expect(el.hasClass("watch12")).toBeFalsy();

            done();
        }, WAIT_FOR_WATCH_TIME);
    });

    it("should not match parent elements", function(done) {
        var spy1 = jasmine.createSpy("spy1"),
            spy2 = jasmine.createSpy("spy2"),
            complete = function() {
                if (spy1.calls.count() === 1 && spy2.calls.count() === 1) done();
            };

        jasmine.sandbox.set("<form id='watch7'><input id='watch8'/></form>");

        DOM.extend("#watch7", {constructor: spy1.and.callFake(complete)});
        DOM.extend("#watch8", {constructor: spy2.and.callFake(complete)});
    });

    it("should not initialize twise after hide/show", function(done) {
        jasmine.sandbox.set("<a class='extend01'></a>");

        var link = DOM.find(".extend01");

        callback.and.callFake(function() {
            expect(this).toBe(link);

            link.hide();

            setTimeout(function() {
                expect(callback.calls.count()).toBe(1);

                done();
            }, WAIT_FOR_WATCH_TIME);
        });

        DOM.extend(".extend01", {constructor: callback});
    });

    it("should not initialize twise after removing element from DOM", function(done) {
        jasmine.sandbox.set("<a class='extend02'></a>");

        var link = DOM.find(".extend02");

        callback.and.callFake(function() {
            link.parent().append(link.remove());

            setTimeout(function() {
                expect(callback.calls.count()).toBe(1);

                done();
            }, WAIT_FOR_WATCH_TIME);
        });

        DOM.extend(".extend02", {constructor: callback});
    });

    it("should allow extending the element prototype", function() {
        DOM.extend("*", { test: 555 });

        expect(DOM.create("a").test).toBe(555);
    });

    it("should not expose removable methods", function(done) {
        var spy = jasmine.createSpy("callback2"),
            complete = function() {
                var link = this;

                setTimeout(function() {
                    expect(typeof link.onClick).toBe("undefined");
                    expect(typeof link.doSmth).toBe("undefined");

                    done();
                }, 0);
            };

        jasmine.sandbox.set("<a class=" + randomClass + "></a>");

        DOM.extend("." + randomClass, {
            constructor: spy.and.callFake(complete),
            onClick: function() {},
            doSmth: function() {}
        });
    });

    it("should catch nested elements", function(done) {
        var spy = jasmine.createSpy("ctr");

        DOM.extend("." + randomClass, {constructor: spy});

        spy.and.callFake(function() {
            if (spy.calls.count() === 2) done();
        });

        jasmine.sandbox.set("<div class='" + randomClass + "'><div class='" + randomClass + "'></div></div>");
    });

    it("should not apply extension if condition returns false", function(done) {
        var spy = jasmine.createSpy("ctr");

        jasmine.sandbox.set("<a class=" + randomClass + "></a>");

        DOM.extend("." + randomClass, false, {constructor: spy});

        setTimeout(function() {
            expect(spy).not.toHaveBeenCalled();

            done();
        }, WAIT_FOR_WATCH_TIME);
    });

    // FIXME: find a way to test without exception in browser
    // it("should not stop handle other listeners if any throws an error", function() {
    //     var otherCallback = jasmine.createSpy("otherCallback");

    //     callback.andThrow("stop listeners");

    //     DOM.extend(".watch5", callback);
    //     DOM.extend(".watch5", otherCallback);

    //     jasmine.sandbox.set("<a class='watch5'></a>");

    //     waitsFor(function() {
    //         return callback.calls.count() === 1 && otherCallback.calls.count() === 1;
    //     });
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        // expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        // expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});