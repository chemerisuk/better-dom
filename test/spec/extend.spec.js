describe("extend", function() {
    "use strict";
    
    var WAIT_FOR_WATCH_TIME = 50,
        callback;

    beforeEach(function() {
        setFixtures("<div id='expr'></div><a class='extend'></a><span class='extend'></span><b class='extend'></b>");

        callback = jasmine.createSpy("callback");
    });

    it("should execute contructor property for each element", function() {
        DOM.extend(".extend", {
            constructor: callback
        });

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(3);
        });
    });

    it("should not initialize twise after hide/show", function() {
        setFixtures("<a class='extend01'></a>");

        var link = DOM.find(".extend01");

        DOM.extend(".extend01", callback.andCallFake(function() {
            expect(this).toBe(link);
            
            link.hide();
        }));

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback).toHaveBeenCalled();

            link.show();
        });

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(1);
        });
    });

    it("should not initialize twise after removing element from DOM", function() {
        setFixtures("<a class='extend02'></a>");

        var link = DOM.find(".extend02");

        DOM.extend(".extend02", callback.andCallFake(function() {
            link.remove();
        }));

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback).toHaveBeenCalled();

            setFixtures(link._node);
        });

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(1);
        });
    });

    it("should pass optional template into constructor", function() {
        var template = ["<i class='x1'></i>", "b#x2"];

        callback.andCallFake(function(x1, x2) {
            expect(x1).toBeDefined();
            expect(x1._node).toHaveClass("x1");
            expect(x1._node).toHaveTag("i");

            expect(x2).toBeDefined();
            expect(x2._node).toHaveId("x2");
            expect(x2._node).toHaveTag("b");
        });

        DOM.extend("#expr", template, callback);

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

    it("should allow extending the element prototype", function() {
        DOM.extend("*", {
            test: function() {}
        });

        expect(DOM.create("a").test).toBeDefined();
    });
    
    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});