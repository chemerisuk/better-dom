describe("has", function() {
    "use strict";

    var input;

    beforeEach(function() {
        setFixtures("<input type='checkbox' id='has' required>");

        input = DOM.find("#has");
    });

    it("should return true/false if property/attribute exists", function() {
        input._node.checked = true;
        expect(input.has("required")).toBe(true);
        expect(input.has("unknown")).toBe(false);
        expect(input.has("checked")).toBe(true);

        input._node.checked = false;
        expect(input.has("checked")).toBe(false);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.has(1); }).toThrow();
    });
});
