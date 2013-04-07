describe("call", function() {
    var input, obj = {test: function() {}};

    beforeEach(function() {
        setFixtures("<input id='input'/>");

        input = DOM.find("#input");
    });

    it("should call native object method", function() {
        spyOn(obj, "test");

        input.on("focus", obj.test).call("focus");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should pass parameters into native method", function() {
        
    });

});