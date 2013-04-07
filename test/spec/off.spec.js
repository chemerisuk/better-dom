describe("off", function() {
    var input, link, obj = {test: function() {}, test2: function() {}};

    beforeEach(function() {
        setFixtures("<a id='link'><input id='input'></a>");

        input = DOM.find("#input");
        link = DOM.find("#link");
    });

    it("should remove event handler", function() {
        spyOn(obj, "test");

        input.on("click", obj.test).off("click").call("click");

        expect(obj.test).not.toHaveBeenCalled();
    });

    it("should remove all event handlers if called without the second argument", function() {
        spyOn(obj, "test");
        spyOn(obj, "test2");

        link.on("click", obj.test).on("click input", obj.test2).off("click");
        input.call("click");

        expect(obj.test).not.toHaveBeenCalled();
        expect(obj.test2).not.toHaveBeenCalled();
    });

});