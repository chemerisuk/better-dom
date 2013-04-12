describe("fire", function() {
    var input, callback;

    beforeEach(function() {
        setFixtures("<input id='input'/>");

        input = DOM.find("#input");

        callback = jasmine.createSpy("callback"); 
    });

    it("should trigger event handler", function() {
        input.on("click", callback).fire("click");

        expect(callback).toHaveBeenCalled();
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

    it("should return reference to 'this'", function() {
        expect(input.fire("click")).toEqual(input);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { link.fire(1); }).toThrow();
    });

});