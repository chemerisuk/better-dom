describe("extend", function() {
    "use strict";

    var callback, randomClass,
        beforeSpy1 = jasmine.createSpy("beforeSpy1"),
        beforeSpy2 = jasmine.createSpy("beforeSpy2");

    DOM.extend(".watch11", { constructor: beforeSpy1 });
    DOM.extend(".watch12", { constructor: beforeSpy2 });

    beforeEach(function() {
        callback = jasmine.createSpy("callback");
        randomClass = "ext" + Math.random().toString(32).substr(2);
    });

    it("should execute contructor for each element", function(done) {
        jasmine.sandbox.set("<a class='watch'></a><span class='watch'></span><b class='watch'></b>");

        callback.and.callFake(function() {
            expect(this).toBeDefined();
            expect(this[0]).toBeDefined();

            if (callback.calls.count() === 3) done();
        });

        DOM.extend(".watch", { constructor: callback });
    });

    it("should support shortcut", function(done) {
        DOM.extend(".watch0", callback);

        callback.and.callFake(function() {
            done();
        });

        jasmine.sandbox.set("<a class='watch0'></a>");
    });

    it("should capture any future element on page", function(done) {
        DOM.extend(".watch1", {constructor: callback});

        callback.and.callFake(function() {
            if (callback.calls.count() === 2) done();
        });

        jasmine.sandbox.set("<a class='watch1'></a><span class='watch1'></span>");
    });

    it("should not execute the same extension twice", function(done) {
        var link = DOM.create("<a class=\"ext1 ext2\"></a>"),
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

    // it("should accept different selectors for the same element before ready", function(done) {
    //     var el = DOM.create("div.watch11.watch12");

    //     DOM.ready(function() {
    //         beforeSpy2.and.callFake(function() {
    //             expect(beforeSpy1).toHaveBeenCalled();

    //             beforeSpy1 = null;
    //             beforeSpy2 = null;

    //             done();
    //         });

    //         jasmine.sandbox.set(el);
    //     });
    // });

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
        jasmine.sandbox.set("<a class='" + randomClass + "'></a>");

        var link = DOM.find("." + randomClass);

        callback.and.callFake(function() {
            expect(this).toBe(link);

            link.hide();

            setTimeout(function() {
                expect(callback.calls.count()).toBe(1);

                done();
            }, 50);
        });

        DOM.extend("." + randomClass, {constructor: callback});
    });

    it("should not initialize twise after removing element from DOM", function(done) {
        jasmine.sandbox.set("<a class='" + randomClass + "'></a>");

        var link = DOM.find("." + randomClass);

        callback.and.callFake(function() {
            link.parent().append(link.remove());

            setTimeout(function() {
                expect(callback.calls.count()).toBe(1);

                done();
            }, 50);
        });

        DOM.extend("." + randomClass, {constructor: callback});
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

        DOM.extend("." + randomClass, {constructor: spy, test: function() {}});

        spy.and.callFake(function() {
            var child = this.find("." + randomClass);

            if (child[0]) {
                expect(this.test).not.toBeUndefined();
            }

            expect(this.test).not.toBeUndefined();

            if (spy.calls.count() === 2) done();
        });

        jasmine.sandbox.set("<div class='" + randomClass + "'><div class='" + randomClass + "'></div></div>");
    });

    it("should not apply extension if condition returns false", function(done) {
        var spy = jasmine.createSpy("ctr"),
            el = DOM.create("<a class=" + randomClass + "></a>");

        jasmine.sandbox.set(el);

        DOM.extend("." + randomClass, false, {constructor: spy, a: "b"});

        setTimeout(function() {
            expect(spy).not.toHaveBeenCalled();
            expect(el.a).toBeUndefined();

            done();
        }, 50);
    });

    it("should not stop handle other listeners if any throws an error", function(done) {
        var otherCallback = jasmine.createSpy("otherCallback"),
            errorSpy;

        if ("console" in window) {
            errorSpy = spyOn(window.console, "error");
        }

        callback.and.throwError("stop listeners");

        DOM.extend(".watch5", callback);
        DOM.extend(".watch5", otherCallback);

        otherCallback.and.callFake(function() {
            if (errorSpy) {
                expect(errorSpy).toHaveBeenCalled();
            }

            done();
        });

        jasmine.sandbox.set("<a class='watch5'></a>");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        // expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        // expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});