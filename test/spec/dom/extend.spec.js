describe("extend", function() {
    "use strict";

    var callback;

    beforeEach(function() {
        callback = jasmine.createSpy("callback");
    });

    it("executes contructor for each element", function(done) {
        jasmine.sandbox.set("<a class='t0'></a><span class='t0'></span><b class='t0'></b>");

        callback.and.callFake(function() {
            expect(this).toBeDefined();

            if (callback.calls.count() === 3) {
                done();
            }
        });

        DOM.extend(".t0", { constructor: callback });
    });

    it("supports shortcut", function(done) {
        DOM.extend(".t1", done);

        jasmine.sandbox.set("<a class='t1'></a>");
    });

    it("captures any future element on page", function(done) {
        DOM.extend(".t2", {constructor: callback});

        callback.and.callFake(function() {
            if (callback.calls.count() === 2) {
                done();
            }
        });

        jasmine.sandbox.set("<a class='t2'></a><span class='t2'></span>");
    });

    it("does not execute the same extension twice", function(done) {
        var link = DOM.create("<a class=\"t3-1 t3-2\"></a>"),
            spy = jasmine.createSpy("t3-2"),
            complete = function() {
                if (callback.calls.count() === 1 && spy.calls.count() === 1) {
                    link.remove();

                    done();
                }
            };

        DOM.find("body").append(link);

        DOM.extend(".t3-1", {constructor: callback.and.callFake(complete)});
        DOM.extend(".t3-2", {constructor: spy.and.callFake(complete)});
    });

    it("should accept several watchers of the same selector", function(done) {
        var spy = jasmine.createSpy("callback2"),
            complete = function() {
                if (callback.calls.count() === 2 && spy.calls.count() === 2) done();
            };

        jasmine.sandbox.set("<a class='t4'></a><b class='t4'></b>");

        DOM.extend(".t4", {constructor: callback.and.callFake(complete)});
        DOM.extend(".t4", {constructor: spy.and.callFake(complete)});
    });

    it("accepts different selectors for the same element", function(done) {
        var spy = jasmine.createSpy("callback2"),
            complete = function() {
                if (callback.calls.count() === 2 && spy.calls.count() === 1) done();
            };

        jasmine.sandbox.set("<a class='t5'></a><b class='t5'></b>");

        DOM.extend(".t5", {constructor: callback.and.callFake(complete)});
        DOM.extend("b", {constructor: spy.and.callFake(complete)});
    });

    it("does not matches parent elements", function(done) {
        var spy1 = jasmine.createSpy("spy1"),
            spy2 = jasmine.createSpy("spy2"),
            complete = function() {
                if (spy1.calls.count() === 1 && spy2.calls.count() === 1) done();
            };

        jasmine.sandbox.set("<form id='t6-1'><input id='t6-2'/></form>");

        DOM.extend("#t6-1", {constructor: spy1.and.callFake(complete)});
        DOM.extend("#t6-2", {constructor: spy2.and.callFake(complete)});
    });

    it("does not initialize twise after hide/show", function(done) {
        jasmine.sandbox.set("<a class='t7'></a>");

        var link = DOM.find(".t7");
        var spy = callback;

        callback.and.callFake(function() {
            link.hide();

            setTimeout(function() {
                expect(spy.calls.count()).toBe(1);

                done();
            }, 50);
        });

        DOM.extend(".t7", {constructor: callback});
    });

    it("does not initialize twise after removing element from DOM", function(done) {
        jasmine.sandbox.set("<a class='t8'></a>");

        var link = DOM.find(".t8");
        var spy = callback;

        callback.and.callFake(function() {
            link.remove();

            DOM.find("body").append(link);

            setTimeout(function() {
                expect(spy.calls.count()).toBe(1);

                link.remove();

                done();
            }, 50);
        });

        DOM.extend(".t8", {constructor: callback});
    });

    it("handles nested elements", function(done) {
        var spy = jasmine.createSpy("ctr");

        DOM.extend(".t9", {constructor: spy, test: function() {}});

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

        jasmine.sandbox.set("<div class='t9' id=two><div class='t9' id=one></div></div>");
    });

    it("is always async", function() {
        var spy = jasmine.createSpy("ctr");

        jasmine.sandbox.set("<a class='t10'></a>");

        DOM.extend(".t10", spy);

        expect(spy).not.toHaveBeenCalled();
    });

    it("allows extending the $Element prototype", function() {
        DOM.extend("*", {
            test: function() { return 555 }
        });

        expect(DOM.create("<a>").test()).toBe(555);
        // expect(DOM.mock("<a>").test()).toBe(555);
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

    //     DOM.extend(".t11", callback);
    //     DOM.extend(".t11", otherCallback);

    //     otherCallback.and.callFake(function() {
    //         expect(errorSpy).toHaveBeenCalled();

    //         done();
    //     });

    //     jasmine.sandbox.set("<a class='t11'></a>");
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        // expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        // expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});