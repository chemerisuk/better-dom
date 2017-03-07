describe("fire", function() {
    "use strict";

    var input, callback;

    beforeEach(function() {
        jasmine.sandbox.set("<input id='input'/>");

        input = DOM.find("#input");

        callback = jasmine.createSpy("callback");
    });

    it("should trigger event handler", function() {
        var events = ["click", "focus", "blur", "change"], i;

        for (i = 0; i < 3; ++i) {
            input.on(events[i], callback).fire(events[i]);

            expect(callback.calls.count()).toBe(i + 1);
        }
    });

    it("should trigger native handlers", function() {
        input[0].onclick = callback.and.returnValue(false);

        input.fire("click");

        expect(callback).toHaveBeenCalled();
    });

    it("should trigger native methods if they exist", function() {
        input.fire("focus");

        expect(input.matches(":focus")).toBe(true);

        expect(input[0]).toBe(document.activeElement);
    });

    describe("custom events", function() {
        it("should be allowed", function() {
            input.on("my:click", callback).fire("my:click");

            expect(callback).toHaveBeenCalled();
        });

        it("allow to pass extra data into event", function() {
            var data1 = {x: 1, y: 2};

            callback.and.callFake(function(a, b) {
                expect(a).toBe(data1);

                if (callback.calls.count() === 1) {
                    expect(b).toBeUndefined();
                } else {
                    expect(b).toBe(input);
                }
            });

            input.once("my:click", ["detail"], callback);
            input.fire("my:click", data1);
            expect(callback.calls.count()).toBe(1);

            input.once("click", ["detail", "currentTarget"], callback);
            input.fire("click", data1);
            expect(callback.calls.count()).toBe(2);
        });

        // it("ignore event fire arguments when event props are specified", function() {
        //     var spy = jasmine.createSpy("on");

        //     input.on("my:test", ["target"], spy);
        //     input.fire("my:test", 123);

        //     expect(spy).toHaveBeenCalledWith(input);
        // });
    });

    it("should return false if default action was prevented", function() {
        expect(input.fire("focus")).toBe(true);

        input.on("focus", function() { return false });

        expect(input.fire("focus")).toBe(false);
    });

    it("should return true for empty node", function() {
        expect(DOM.find("some-node").fire("click")).toBe(true);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.fire(1); }).toThrow();
    });

});