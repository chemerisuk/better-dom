describe("extend", function() {
    "use strict";

    var /*WAIT_FOR_WATCH_TIME = 100,*/
        callback;

    beforeEach(function() {
        setFixtures("<div id='expr'></div><a class='extend'></a><span class='extend'></span><b class='extend'></b>");

        callback = jasmine.createSpy("callback");
    });

    it("should execute contructor property for each element", function() {
        runs(function() {
            DOM.extend(".extend", {
                constructor: callback
            });
        });

        waitsFor(function() {
            return callback.callCount === 3;
        });
    });

    // FIXME: Chrome 30 fails on this test
    // it("should not initialize twise after hide/show", function() {
    //     setFixtures("<a class='extend01'></a>");

    //     var link = DOM.find(".extend01");

    //     DOM.extend(".extend01", callback.andCallFake(function() {
    //         expect(this).toBe(link);

    //         link.hide();
    //     }));

    //     waits(WAIT_FOR_WATCH_TIME);

    //     runs(function() {
    //         expect(callback).toHaveBeenCalled();

    //         link.show();
    //     });

    //     waits(WAIT_FOR_WATCH_TIME);

    //     runs(function() {
    //         expect(callback.callCount).toBe(1);
    //     });
    // });

    // FIXME: Chrome 30 fails on this test
    // it("should not initialize twise after removing element from DOM", function() {
    //     setFixtures("<a class='extend02'></a>");

    //     var link = DOM.find(".extend02");

    //     DOM.extend(".extend02", callback.andCallFake(function() {
    //         link.remove();
    //     }));

    //     waits(WAIT_FOR_WATCH_TIME);

    //     runs(function() {
    //         expect(callback).toHaveBeenCalled();

    //         setFixtures(link._node);
    //     });

    //     waits(WAIT_FOR_WATCH_TIME);

    //     runs(function() {
    //         expect(callback.callCount).toBe(1);
    //     });
    // });

    it("should allow extending the element prototype", function() {
        DOM.extend("*", {
            test: function() {}
        });

        expect(DOM.create("a").test).toBeDefined();
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        // expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        // expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});