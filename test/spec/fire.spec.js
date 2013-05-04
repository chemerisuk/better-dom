describe("fire", function() {
    var input, callback;

    beforeEach(function() {
        setFixtures("<input id='input'/>");

        input = DOM.find("#input");

        callback = jasmine.createSpy("callback"); 
    });

    it("should trigger event handler", function() {
        var events = ["click", "focus", "blur", "change"], i;

        for (i = 0; i < 3; ++i) {
            input.on(events[i], callback).fire(events[i]);

            expect(callback.callCount).toBe(i + 1);
        }
    });

    it("should trigger native handlers", function() {
        input._node.onclick = callback;

        input.fire("click");

        expect(callback).toHaveBeenCalled();
    });

    it("should trigger custom events", function() {
        input.on("my:click", callback).fire("my:click");

        expect(callback).toHaveBeenCalled();
    });

    it("should accept optional data object into custom events", function() {
        var detail = {x: 1, y: 2};

        callback.andCallFake(function(e) {
            expect(e.get("detail")).toBe(detail);
        });

        input.on("my:click", callback);

        input.fire("my:click", detail);

        expect(callback).toHaveBeenCalled();
    });

    it("should return reference to 'this'", function() {
        expect(input.fire("click")).toEqual(input);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { link.fire(1); }).toThrow();
    });

});