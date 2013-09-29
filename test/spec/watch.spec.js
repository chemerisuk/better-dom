describe("watch", function() {
    "use strict";

    var callback;

    beforeEach(function() {
        callback = jasmine.createSpy("callback");
    });

    it("should execute callback for every existed element on page", function() {
        setFixtures("<a class='watch'></a><span class='watch'></span><b class='watch'></b>");

        callback.andCallFake(function(el) {
            expect(el).toBeDefined();
            expect(el.length).toBe(1);
        });

        runs(function() {
            DOM.watch(".watch", callback);
        });

        waitsFor(function() {
            return callback.callCount === 3;
        });
    });

    it("should execute for each matched future element on page", function() {
        runs(function() {
            DOM.watch(".watch1", callback);
        });

        runs(function() {
            setFixtures("<a class='watch1'></a><span class='watch1'></span>");
        });

        waitsFor(function() {
            return callback.callCount === 2;
        });
    });

    it("should accept several watchers of the same selector", function() {
        var spy = jasmine.createSpy("callback2");

        setFixtures("<a class='watch4'></a><b class='watch4'></b>");

        runs(function() {
            DOM.watch(".watch4", callback);
            DOM.watch(".watch4", spy);
        });

        waitsFor(function() {
            return callback.callCount === 2 && spy.callCount === 2;
        });
    });

    it("should accept different selectors for the same element", function() {
        var spy = jasmine.createSpy("callback2");

        setFixtures("<a class='watch4'></a><b class='watch4'></b>");

        runs(function() {
            DOM.watch(".watch4", callback);
            DOM.watch("b", spy);
        });

        waitsFor(function() {
            return callback.callCount === 2 && spy.callCount === 1;
        });
    });

    // FIXME: find a way to test without exception in browser
    // it("should not stop handle other listeners if any throws an error", function() {
    //     var otherCallback = jasmine.createSpy("otherCallback");

    //     DOM.watch(".watch5", callback.andCallFake(function() {
    //         throw "watch";
    //     }));

    //     DOM.watch(".watch5", otherCallback);

    //     setFixtures("<a class='watch5'></a>");

    //     waits(WAIT_FOR_WATCH_TIME);

    //     runs(function() {
    //         expect(callback).toHaveBeenCalled();
    //         expect(otherCallback).toHaveBeenCalled();
    //     });
    // });

    it("should accept callbacks with different once argument for the same selector", function() {
        var otherCallback = jasmine.createSpy("otherCallback");

        runs(function() {
            DOM.watch("#watch6", callback, true);
            DOM.watch("#watch6", otherCallback);

            setFixtures("<a id='watch6'></a>");
        });

        waitsFor(function() {
            if (callback.callCount === 1) {
                if (otherCallback.callCount === 2) {
                    return true;
                }

                if (otherCallback.callCount === 1) {
                    var link = DOM.find("#watch6");

                    link.remove();

                    setFixtures(link._node);
                }
            }
        });
    });

    it("should not match parent elements", function() {
        var spy1 = jasmine.createSpy("spy1"),
            spy2 = jasmine.createSpy("spy2");

        setFixtures("<form id='watch7'><input id='watch8'/></form>");

        runs(function() {
            DOM.watch("#watch7", spy1);
            DOM.watch("#watch8", spy2);
        });

        waitsFor(function() {
            return spy1.callCount === 1 && spy2.callCount === 1;
        });
    });

});