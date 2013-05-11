describe("off", function() {
    "use strict";
    
    var input, link, obj = {test: function() { }, test2: function() {}};

    beforeEach(function() {
        setFixtures("<a id='link'><input id='input'></a>");

        input = DOM.find("#input");
        link = DOM.find("#link");
    });

    it("should remove event handler", function() {
        spyOn(obj, "test");

        input.on("click", obj.test).off("click").fire("click");

        expect(obj.test).not.toHaveBeenCalled();
    });

    it("should remove all event handlers if called without the second argument", function() {
        spyOn(obj, "test");
        spyOn(obj, "test2");

        link.on("click", obj.test).on("click input", obj.test2).off("click");
        input.fire("click");

        expect(obj.test).not.toHaveBeenCalled();
        expect(obj.test2).not.toHaveBeenCalled();
    });

    it("should return reference to 'this'", function() {
        expect(input.off("click")).toEqual(input);
    });

    it("should throw error if agruments are invalid", function() {
        expect(function() { link.off(123); }).toThrow();
    });

});