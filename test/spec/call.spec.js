describe("call", function() {
    var input, callback;

    beforeEach(function() {
        setFixtures("<input id='input'/>");

        input = DOM.find("#input");

        callback = jasmine.createSpy("callback");
    });

    it("should call native object method", function() {
        input.on("click", callback).call("click");

        expect(callback).toHaveBeenCalled();
    });

    it("should pass parameters into native method", function() {
        
    });

});