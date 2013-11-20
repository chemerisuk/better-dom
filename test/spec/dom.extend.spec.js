describe("extend", function() {
    "use strict";

    var WAIT_FOR_WATCH_TIME = 50,
        callback;

    beforeEach(function() {
        setFixtures("<div id='expr'></div><a class='extend'></a><span class='extend'></span><b class='extend'></b>");

        callback = jasmine.createSpy("callback");
    });

    it("should execute contructor for each element", function() {
        setFixtures("<a class='watch'></a><span class='watch'></span><b class='watch'></b>");

        callback.andCallFake(function() {
            expect(this).toBeDefined();
            expect(this.length).toBe(1);
        });

        runs(function() {
            DOM.extend(".watch", callback);
        });

        waitsFor(function() {
            return callback.callCount === 3;
        });
    });

    it("should execute for each matched future element on page", function() {
        runs(function() {
            DOM.extend(".watch1", callback);
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
            DOM.extend(".watch4", callback);
            DOM.extend(".watch4", spy);
        });

        waitsFor(function() {
            return callback.callCount === 2 && spy.callCount === 2;
        });
    });

    it("should accept different selectors for the same element", function() {
        var spy = jasmine.createSpy("callback2");

        setFixtures("<a class='watch4'></a><b class='watch4'></b>");

        runs(function() {
            DOM.extend(".watch4", callback);
            DOM.extend("b", spy);
        });

        waitsFor(function() {
            return callback.callCount === 2 && spy.callCount === 1;
        });
    });

    // it("should not match parent elements", function() {
    //     var spy1 = jasmine.createSpy("spy1"),
    //         spy2 = jasmine.createSpy("spy2");

    //     setFixtures("<form id='watch7'><input id='watch8'/></form>");

    //     runs(function() {
    //         DOM.extend("#watch7", spy1);
    //         DOM.extend("#watch8", spy2);
    //     });

    //     waitsFor(function() {
    //         return spy1.callCount === 1 && spy2.callCount === 1;
    //     });
    // });

    it("should not initialize twise after hide/show", function() {
        setFixtures("<a class='extend01'></a>");

        var link = DOM.find(".extend01"), calledOnce;

        runs(function() {
            DOM.extend(".extend01", callback.andCallFake(function() {
                expect(this).toBe(link);

                link.hide();

                setTimeout(function() {
                    if (callback.callCount === 1) calledOnce = true;
                }, WAIT_FOR_WATCH_TIME);
            }));
        });

        waitsFor(function() { return calledOnce === true });
    });

    it("should not initialize twise after removing element from DOM", function() {
        setFixtures("<a class='extend02'></a>");

        var link = DOM.find(".extend02"), calledOnce;

        runs(function() {
            DOM.extend(".extend02", callback.andCallFake(function() {
                link.remove();

                setTimeout(function() {
                    if (callback.callCount === 1) calledOnce = true;
                }, WAIT_FOR_WATCH_TIME);
            }));
        });

        waitsFor(function() { return calledOnce === true });
    });

    it("should allow extending the element prototype", function() {
        DOM.extend("*", {
            test: function() {}
        });

        expect(DOM.create("a").test).toBeDefined();
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

    // FIXME: Chrome 30 fails on this test
    // it("should accept callbacks with different once argument for the same selector", function() {
    //     var otherCallback = jasmine.createSpy("otherCallback");

    //     runs(function() {
    //         DOM.watch("#watch6", callback, true);
    //         DOM.watch("#watch6", otherCallback);

    //         setFixtures("<a id='watch6'></a>");
    //     });

    //     waitsFor(function() {
    //         if (callback.callCount === 1) {
    //             if (otherCallback.callCount === 1) {
    //                 var link = DOM.find("#watch6");

    //                 link.remove();

    //                 setFixtures(link._node);
    //             } else if (otherCallback.callCount === 2) {
    //                 return true;
    //             }
    //         }
    //     });
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        // expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        // expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});