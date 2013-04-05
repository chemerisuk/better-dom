describe("capture", function() {
    var input, obj = {test: function() {}, test2: function() {}};

    beforeEach(function() {
        setFixtures('<input id="test"/>');

        input = DOM.find("#test");
    });

    it("should happen before on", function() {
        var indicator;

        spyOn(obj, "test2").andCallFake(function() {
            indicator = false;
        });

        spyOn(obj, "test").andCallFake(function() {
            indicator = true;
        });

        DOM.on("click", obj.test);
        DOM.capture("click", obj.test2);

        input.call("click");

        expect(indicator).toEqual(true);
    });

    it("should handle non-bubbling events", function() {
        spyOn(obj, "test");

        DOM.capture("focus", obj.test);

        input.call("focus");

        expect(obj.test).toHaveBeenCalled();
    });

});