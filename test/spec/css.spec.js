describe("css", function() {
    var link;

    beforeEach(function() {
        setFixtures("<a id='test' style='line-height: 2; color: red'></a>");

        link = DOM.find("#test");
    });

    it("should read style property", function() {
        expect(link.getStyle("color")).toBe("red");
    });

    it("should read properties by dash-separated key", function() {
        expect(link.getStyle("line-height")).toBe("2");
    });

    it("should handle vendor-prefixed properties", function() {

    });

    it("should read runtime style property if style doesn't contain any value", function() {
        expect(link.getStyle("font-size")).toBeTruthy();
    });

});