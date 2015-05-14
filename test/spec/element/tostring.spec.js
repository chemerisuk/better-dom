describe("Node", function() {
    "use strict";

    // it("should always have length property", function() {
    //     expect(DOM.find("abc").length).toBe(0);
    // });

    it("should have overloaded toString", function() {
        var link = DOM.create("<a>"),
            input = DOM.create("<input>"),
            spans = DOM.createAll("<i></i><b></b>"),
            empty = DOM.mock();

        expect(link.toString()).toBe("<a>");
        expect(input.toString()).toBe("<input>");
        expect(spans.toString()).toBe("<i>,<b>");
        expect(empty.toString()).toBe("");
    });
});
