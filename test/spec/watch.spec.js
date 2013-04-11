describe("watch", function() {
    var WAIT_FOR_WATCH_TIME = 50,
        callback;

    beforeEach(function() {
        setFixtures("<a id='test' class='test'></a><span class='test'></span><b class='test'></b>");

        callback = jasmine.createSpy("callback");
    });

    it("should execute callback for every existed element on page", function() {
        DOM.watch(".test", callback);

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(3);
        });
    });

    it("should execute for each matched future element on page", function() {
        DOM.watch(".test1", callback);

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback).not.toHaveBeenCalled();

            setFixtures("<a class='test1'></a><span class='test1'></span>");
        });

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(2);
        });
    });

    it("should have DOM element as the first argument", function() {
        DOM.watch(".test", callback.andCallFake(function(el) {
            expect(el).toBeDefined();
            expect(el._node).toBeTruthy();
        }));

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(3);
        });
    });

    it("should not initialize twise after hide/show", function() {
        var link;

        DOM.watch("#test", callback.andCallFake(function(el) {
            expect(el).toBeDefined();

            link = el.hide();
        }));

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            link.show();
        });

        waits(WAIT_FOR_WATCH_TIME);

        runs(function() {
            expect(callback.callCount).toBe(1);
        });
    });

});