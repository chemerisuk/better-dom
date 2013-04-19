describe("css", function() {
    var link;

    beforeEach(function() {
        setFixtures("<a id='test' style='line-height: 2; color: red'></a>");

        link = DOM.find("#test");
    });

    describe("getStyle", function() {
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

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.getStyle(1); }).toThrow();
        });
    });

    describe("setStyle", function() {
        it("should return reference to 'this'", function() {
            expect(link.setStyle("color", "white")).toBe(link);
        });

        it("should set style properties", function() {
            expect(link.setStyle("color", "white")._node.style.color).toBe("white");
        });

        it("should support styles object", function() {
            link.setStyle({color: "white", padding: "5px"});

            expect(link._node.style.color).toBe("white");
            expect(link._node.style.padding).toBe("5px");
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.setStyle(1); }).toThrow();
        });
    });

});