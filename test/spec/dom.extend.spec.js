describe("extend", function() {
    "use strict";

    var WAIT_FOR_WATCH_TIME = 50,
        callback;

    beforeEach(function() {
        callback = jasmine.createSpy("callback");
    });

    it("should execute contructor for each element", function() {
        setFixtures("<a class='watch'></a><span class='watch'></span><b class='watch'></b>");

        callback.andCallFake(function() {
            expect(this).toBeDefined();
            expect(this.length).toBe(1);
            // ??? proto is undefined in PhantomJS
            // expect(proto).toBe(Object.getPrototypeOf(this));
        });

        DOM.extend(".watch", callback);

        waitsFor(function() {
            return callback.callCount === 3;
        });
    });

    it("should capture any future element on page", function() {
        DOM.extend(".watch1", callback);

        runs(function() {
            setFixtures("<a class='watch1'></a><span class='watch1'></span>");
        });

        waitsFor(function() {
            return callback.callCount === 2;
        });
    });

    it("should not execute the same extension twice", function() {
        var link = DOM.create("a.ext1.ext2"),
            spy = jasmine.createSpy("ext2"),
            calledOnce;

        DOM.find("body").append(link);

        DOM.extend(".ext1", callback);
        DOM.extend(".ext2", spy);

        setTimeout(function() {
            link.remove();

            if (callback.callCount === 1 && spy.callCount === 1) calledOnce = true;
        }, WAIT_FOR_WATCH_TIME * 5);

        waitsFor(function() { return calledOnce; });
    });

    it("should accept several watchers of the same selector", function() {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime();

        setFixtures("<a class=" + cls + "></a><b class=" + cls + "></b>");

        DOM.extend("." + cls, callback);
        DOM.extend("." + cls, spy);

        waitsFor(function() {
            return callback.callCount === 2 && spy.callCount === 2;
        });
    });

    it("should accept different selectors for the same element", function() {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime();

        setFixtures("<a class=" + cls + "></a><b class=" + cls + "></b>");

        DOM.extend("." + cls, callback);
        DOM.extend("b", spy);

        waitsFor(function() {
            return callback.callCount === 2 && spy.callCount === 1;
        });
    });

    it("should not match parent elements", function() {
        var spy1 = jasmine.createSpy("spy1"),
            spy2 = jasmine.createSpy("spy2");

        setFixtures("<form id='watch7'><input id='watch8'/></form>");

        // FIXME: strange behavior if to reverse extend calls order
        DOM.extend("#watch8", spy2);
        DOM.extend("#watch7", spy1);

        waitsFor(function() {
            return spy1.callCount === 1 && spy2.callCount === 1;
        });
    });

    it("should not initialize twise after hide/show", function() {
        setFixtures("<a class='extend01'></a>");

        var link = DOM.find(".extend01"), calledOnce;

        DOM.extend(".extend01", callback.andCallFake(function() {
            expect(this).toBe(link);

            link.hide();

            setTimeout(function() {
                if (callback.callCount === 1) calledOnce = true;
            }, WAIT_FOR_WATCH_TIME);
        }));

        waitsFor(function() { return calledOnce === true });
    });

    it("should not initialize twise after removing element from DOM", function() {
        setFixtures("<a class='extend02'></a>");

        var link = DOM.find(".extend02"), calledOnce;

        DOM.extend(".extend02", callback.andCallFake(function() {
            var parent = link.parent();

            parent.append(link.remove());

            setTimeout(function() {
                if (callback.callCount === 1) calledOnce = true;
            }, WAIT_FOR_WATCH_TIME);
        }));

        waitsFor(function() { return calledOnce === true });
    });

    it("should allow extending the element prototype", function() {
        DOM.extend("*", {
            test: 555
        });

        expect(DOM.create("a").test).toBe(555);
    });

    it("should not expose event handlers", function() {
        var spy = jasmine.createSpy("callback2"),
            cls = "ext" + new Date().getTime(), link;

        setFixtures("<a class=" + cls + "></a>");

        link = DOM.find("." + cls);

        DOM.extend("." + cls, {
            constructor: spy,
            onClick: function() {}
        });

        waitsFor(function() { return spy.callCount === 1 && typeof link.onClick === "undefined" });
    });

    // FIXME: find a way to test without exception in browser
    // it("should not stop handle other listeners if any throws an error", function() {
    //     var otherCallback = jasmine.createSpy("otherCallback");

    //     callback.andThrow("stop listeners");

    //     DOM.extend(".watch5", callback);
    //     DOM.extend(".watch5", otherCallback);

    //     setFixtures("<a class='watch5'></a>");

    //     waitsFor(function() {
    //         return callback.callCount === 1 && otherCallback.callCount === 1;
    //     });
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.extend(1); }).toThrow();
        // expect(function() { DOM.extend(" * ", function() {}); }).toThrow();
        // expect(function() { DOM.extend("div > *", function() {}); }).toThrow();
        //expect(function() { DOM.extend("*", {constructor: function() {}}); }).toThrow();
    });

});