describe("call", function() {
    var input, callback;

    beforeEach(function() {
        setFixtures("<input id='input'/>");

        input = DOM.find("#input");

        callback = jasmine.createSpy("callback");
    });

    it("should call native object method", function() {
        input.call("focus");

        expect(input._node).toBe(document.activeElement);
    });

    it("should pass parameters into native method", function() {
        
    });

});