describe("empty", function() {
    var div;

    beforeEach(function() {
        div = DOM.create("div>a+a");
    });

    it("should remove child element(s) from DOM", function() {
        expect(div[0].childNodes.length).toBe(2);
        expect(div.empty()).toBe(div);
        expect(div).toBeEmpty();
    });

    it("should set text input value to empty string", function () {
        var input = DOM.create("input[value=foo]");
        expect(input).toHaveProp("value", "foo");
        expect(input.empty()).toBe(input);
        expect(input).toBeEmpty();
    });

    it("does nothing for empty nodes", function() {
        var empty = DOM.mock();
        expect(empty.empty()).toBe(empty);
    });
});
