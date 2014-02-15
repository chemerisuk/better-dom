describe("extend", function() {
    "use strict";

    var WAIT_FOR_WATCH_TIME = 50,
        callback,
        CLS_INDEX = 0;

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
    });

    it("should execute contructor for each element", function(done) {
        jasmine.sandbox.set("<a class='watch'></a><span class='watch'></span><b class='watch'></b>");

        callback.and.callFake(function() {
            expect(this).toBeDefined();
            expect(this.length).toBe(1);
        });

        DOM.extend(".watch", {
            constructor: callback
        });

        setTimeout(function() {
            expect(callback.calls.count()).toBe(3);

            done();
        }, WAIT_FOR_WATCH_TIME);
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

        jasmine.sandbox.set("<a class='watch1'></a><span class='watch1'></span>");

        setTimeout(function() {
            expect(callback.calls.count()).toBe(2);

            done();
        }, WAIT_FOR_WATCH_TIME);
    });

    it("should not execute the same extension twice", function(done) {
        var link = DOM.create("a.ext1.ext2"),
            spy = jasmine.createSpy("ext2");

        DOM.find("body").append(link);

        DOM.extend(".ext1", {constructor: callback});
        DOM.extend(".ext2", {constructor: spy});

        setTimeout(function() {
            link.remove();

            expect(callback.calls.count()).toBe(1);
            expect(spy.calls.count()).toBe(1);

            done();
        }, WAIT_FOR_WATCH_TIME);
    });

    it("should accept several watchers of the same selector", function(done) {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime();

        jasmine.sandbox.set("<a class=" + cls + "></a><b class=" + cls + "></b>");

        DOM.extend("." + cls, {constructor: callback});
        DOM.extend("." + cls, {constructor: spy});

        setTimeout(function() {
            expect(callback.calls.count()).toBe(2);
            expect(spy.calls.count()).toBe(2);

            done();
        }, WAIT_FOR_WATCH_TIME);
    });

    it("should accept different selectors for the same element", function(done) {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime();

        jasmine.sandbox.set("<a class=" + cls + "></a><b class=" + cls + "></b>");

        DOM.extend("." + cls, {constructor: callback});
        DOM.extend("b", {constructor: spy});

        setTimeout(function() {
            expect(callback.calls.count()).toBe(2);
            expect(spy.calls.count()).toBe(1);

            done();
        }, WAIT_FOR_WATCH_TIME);
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
            spy2 = jasmine.createSpy("spy2");

        jasmine.sandbox.set("<form id='watch7'><input id='watch8'/></form>");

        DOM.extend("#watch7", {constructor: spy1});
        DOM.extend("#watch8", {constructor: spy2});

        setTimeout(function() {
            expect(spy1.calls.count()).toBe(1);
            expect(spy2.calls.count()).toBe(1);

            done();
        }, WAIT_FOR_WATCH_TIME);
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
            var parent = link.parent();

            parent.append(link.remove());

            setTimeout(function() {
                expect(callback.calls.count()).toBe(1);

                done();
            }, WAIT_FOR_WATCH_TIME);
        });

        DOM.extend(".extend02", {constructor: callback});
    });

    it("should allow extending the element prototype", function() {
        DOM.extend("*", {
            test: 555
        });

        expect(DOM.create("a").test).toBe(555);
    });

    it("should not expose removable methods", function(done) {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime(), link;

        jasmine.sandbox.set("<a class=" + cls + "></a>");

        link = DOM.find("." + cls);

        DOM.extend("." + cls, {
            constructor: spy,
            onClick: function() {},
            doSmth: function() {}
        });

        setTimeout(function() {
            expect(spy.calls.count()).toBe(1);
            expect(typeof link.onClick).toBe("undefined");
            expect(typeof link.doSmth).toBe("undefined");

            done();
        }, WAIT_FOR_WATCH_TIME);
    });

    it("should catch nested elements", function(done) {
        var cls = "watchhh" + CLS_INDEX++;

        DOM.extend("." + cls, {constructor: callback});

        jasmine.sandbox.set("<div class='" + cls + "'><div class='" + cls + "'></div></div>");

        setTimeout(function() {
            expect(callback.calls.count()).toBe(2);

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