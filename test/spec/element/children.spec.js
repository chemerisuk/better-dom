describe("children", function() {
    "use strict";

    beforeEach(function() {

    });

    it("should read all children elements", function() {
        var select = DOM.mock("<select name='n6'><option value='v6'></option><option value='v66' selected></option></select>");

        expect(select.children().length).toBe(2);
    });

    it("should allow to filter children by selector", function() {
        var list = DOM.create("<ul><li></li><li></li><li></li></ul>");

        expect(list.children().length).toBe(3);
        expect(list.children("a").length).toBe(0);
        expect(list.children("li").length).toBe(3);
    });
});
