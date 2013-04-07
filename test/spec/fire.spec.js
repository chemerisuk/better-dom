describe("fire", function() {
    var input, obj = {test: function() {}};

    beforeEach(function() {
        setFixtures("<input id='input'/>");

        input = DOM.find("#input");  
    });

    it("should trigger event handler", function() {
        spyOn(obj, "test");

        input.on("click", obj.test).fire("click");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should trigger native handlers", function() {
        spyOn(obj, "test");

        input._node.onclick = obj.test;

        input.fire("click");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should trigger custom events", function() {
        spyOn(obj, "test");

        input.on("my:click", obj.test).fire("my:click");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should return reference to 'this'", function() {
        expect(input.fire("click")).toEqual(input);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { link.fire(123); }).toThrow();
    });

});