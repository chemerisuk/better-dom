describe("$Element#empty", function() {
    "use strict";

    it("should remove all children", function() {
        var list = DOM.create("ul>li*3");

        expect(list.empty()).toBe(list);

        expect(list.get()).toBe("");
    });

    it("should remove all nodes", function() {
        var link = DOM.create("a");

        link.set("text <span>ok</span>");
        expect(link.empty()).toBe(link);

        expect(link.get()).toBe("");
    });

    it("should ignore with empty nodes", function() {
        var node = DOM.find("some-node");

        expect(node.empty()).toBe(node);
    })
});
