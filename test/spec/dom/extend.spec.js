describe("extend", function() {
    "use strict";

    var callback, randomClass,
        beforeSpy1 = jasmine.createSpy("beforeSpy1"),
        beforeSpy2 = jasmine.createSpy("beforeSpy2");

    DOM.extend(".watch11", { constructor: beforeSpy1 });
    DOM.extend(".watch12", { constructor: beforeSpy2 });

    beforeEach(function() {
        callback = jasmine.createSpy("callback");
        randomClass = "ext" + Math.random().toString(32).slice(2);
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
            link.remove();

            DOM.find("body").append(link);

            setTimeout(function() {
                expect(callback.calls.count()).toBe(1);

                link.remove();

                done();
            }, 50);
        });

        DOM.extend("." + randomClass, {constructor: callback});
    });

    it("handles nested elements", function(done) {
        var spy = jasmine.createSpy("ctr");

        DOM.extend("." + randomClass, {constructor: spy, test: function() {}});

        spy.and.callFake(function() {
            if (spy.calls.count() === 1) {
                // expect(this).toHaveProp("id", "two");
                expect(this.test).toBeDefined();
            } else {
                // expect(this).toHaveProp("id", "one");
                expect(this.test).toBeDefined();

                done();
            }
        });

        jasmine.sandbox.set("<div class='" + randomClass + "' id=two><div class='" + randomClass + "' id=one></div></div>");
    });

    it("is always async", function() {
        var spy = jasmine.createSpy("ctr");

        jasmine.sandbox.set("<a class=" + randomClass + "></a>");

        DOM.extend("." + randomClass, spy);

        expect(spy).not.toHaveBeenCalled();
    });

    it("allows extending the $Element prototype", function() {
        DOM.extend("*", {
            test: function() { return 555 }
        });

        expect(DOM.create("<a>").test()).toBe(555);

        var mocked = DOM.mock();

        expect(mocked.test()).toBe(mocked);
    });

    it("allows extending the $Document prototype", function() {
        DOM.extend({
            test: function() { return 555 }
        });

        expect(DOM.test()).toBe(555);
    });

    // it("should not stop handle other listeners if any throws an error", function(done) {
    //     var otherCallback = jasmine.createSpy("otherCallback"),
    //         // DOM.extend uses setTimeout for safe logging of an error
    //         errorSpy = spyOn(window, "setTimeout");

    //     callback.and.throwError("stop listeners");

    //     DOM.extend(".watch5", callback);
    //     DOM.extend(".watch5", otherCallback);

    //     otherCallback.and.callFake(function() {
    //         expect(errorSpy).toHaveBeenCalled();

    //         done();
    //     });

    //     jasmine.sandbox.set("<a class='watch5'></a>");
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        // expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        // expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});