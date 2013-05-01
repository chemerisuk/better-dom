describe("event", function() {
    var link, input, spy;

    beforeEach(function() {
        setFixtures("<a href='#' id='test'>test element</a><input id='input'/>");

        link = DOM.find("#test");
        input = DOM.find("#input");

        spy = jasmine.createSpy("callback");
    });

    it("should have get/preventDefault/stopPropagation methods", function() {
        spy.andCallFake(function(e) {
            expect(e).toBeDefined();
            expect(typeof e.get).toBe("function");
            expect(typeof e.preventDefault).toBe("function");
            expect(typeof e.stopPropagation).toBe("function");
        });

        link.on("focus", spy).fire("focus");

        expect(spy).toHaveBeenCalled();
    });

    // it("should prevent default action after preventDefault call", function() {
    //     spy.andCallFake(function(e) {
    //         e.preventDefault();
    //     });

    //     input.call("focus");

    //     expect(input._node).toBe(document.activeElement);

    //     input.on("blur", spy);

    //     link.call("focus");

    //     expect(spy).toHaveBeenCalled();

    //     console.log(document.activeElement.nodeName);

    //     expect(input._node).toBe(document.activeElement);
    // });

    it("should stop event bubbling after stopPropagation call", function() {
        var otherSpy = jasmine.createSpy("callback2");

        spy.andCallFake(function(e) {
            e.stopPropagation();
        });

        DOM.on("click", otherSpy);
        link.on("click", spy).fire("click");

        expect(spy).toHaveBeenCalled();
        expect(otherSpy).not.toHaveBeenCalled();
    });

});