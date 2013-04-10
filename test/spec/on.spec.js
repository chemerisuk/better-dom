describe("on", function() {
    var link, input, obj = {test: function() { }, test2: function() {}};

    beforeEach(function() {
        setFixtures("<a id='test'>test element</a><input id='input'/>");

        link = DOM.find("#test");
        input = DOM.find("#input");
    });

    it("should return reference to 'this'", function() {
        expect(input.on("click", obj.test)).toEqual(input);
    });

    it("should accept single callback", function() {
        spyOn(obj, "test");

        link.on("click", obj.test).call("click");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should accept optional event filter", function() {
        spyOn(obj, "test");

        DOM.on("click input", obj.test);

        link.call("click");

        expect(obj.test).not.toHaveBeenCalled();

        input.call("click");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should accept array of events", function() {
        spyOn(obj, "test");

        input.on(["focus", "click"], obj.test).call("focus");

        expect(obj.test).toHaveBeenCalled();

        input.call("click");

        expect(obj.test.callCount).toEqual(2);
    });

    it("should accept event object", function() {
        spyOn(obj, "test");
        spyOn(obj, "test2");

        input.on({focus: obj.test, click: obj.test2});

        input.call("focus");

        expect(obj.test).toHaveBeenCalled();

        input.call("click");

        expect(obj.test2).toHaveBeenCalled();
    });

    it("should have target element as 'this' by default", function() {
        spyOn(obj, "test").andCallFake(function() {
            expect(this).toEqual(input);
        });

        input.on("click", obj.test).call("click");
    });

    it("should not stop to call handlers if any of them throws an error inside", function() {
        window.onerror = function() {
            return true; // suppress displaying expected error for this test
        };

        spyOn(obj, "test").andCallFake(function() { throw "test"; });
        spyOn(obj, "test2");

        input.on("click", obj.test).on("click", obj.test2).call("click");

        expect(obj.test2).toHaveBeenCalled();

        window.onerror = null; // restore default error handling
    });

    it("should happen before on if the third argument is 'true'", function() {
        var indicator;

        spyOn(obj, "test2").andCallFake(function() {
            indicator = false;
        });

        spyOn(obj, "test").andCallFake(function() {
            indicator = true;
        });

        DOM.on("click", obj.test);
        DOM.on("click", obj.test2, true);

        input.call("click");

        expect(indicator).toEqual(true);
    });

    it("should handle non-bubbling events if the third argument is 'true'", function() {
        spyOn(obj, "test");

        DOM.on("focus", obj.test, true);

        input.call("focus");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.on(123); }).toThrow();
    });

});