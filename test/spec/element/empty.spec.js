describe("empty", function() {
    var div;

    beforeEach(function() {
        div = DOM.create("div>a+a");
    });

    it("should remove child element(s) from DOM", function() {
        expect(div[0].childNodes.length).toBe(2);
        expect(div.empty()).toBe(div);
        expect(div[0].childNodes.length).toBe(0);
    });

    it("should set text input value to empty string", function () {
        var input = DOM.create("input[value=foo]");
        expect(input[0].value).toBe("foo");
        expect(input.empty()).toBe(input);
        expect(input[0].value).toBe("");
    });

    it("does nothing for empty nodes", function() {
        var empty = DOM.mock();
        expect(empty.empty()).toBe(empty);
    });
});

