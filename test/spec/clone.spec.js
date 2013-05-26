describe("clone", function() {
    "use strict";
    
    var link;

    beforeEach(function() {
        setFixtures("<a id='link'><input id='input'></a>");

        link = DOM.find("#link");
    });

    it("should clone elements", function() {
        var clone = link.clone(),
            child = clone.child(0);

        setFixtures(clone._node);

        expect(clone._node).not.toBe(link._node);
        expect(clone._node).toHaveTag("a");
        expect(clone._node).toHaveId("link");

        expect(child._node).not.toBe(link.child(0)._node);
        expect(child._node).toHaveTag("input");
        expect(child._node).toHaveId("input");
    });

});