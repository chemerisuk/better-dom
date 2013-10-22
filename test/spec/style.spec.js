describe("style", function() {
    "use strict";

    var link, links;

    beforeEach(function() {
        setFixtures("<a id='test0' style='z-index:2;line-height:2;color:red;padding:5px;margin:2px;border:1px solid;float:left;display:block;width:100px'>test</a><a id='test1' style='line-height:2;color:red;padding:5px;margin:2px;border:1px solid;float:left;display:block;width:100px'>test</a>");

        link = DOM.find("#test0");
        links = DOM.findAll("#test0, #test1");
    });

    describe("getter", function() {
        it("should read style property", function() {
            expect(link.style("color")).toBe("red");
        });

        it("should read properties by dash-separated key", function() {
            expect(link.style("line-height")).toBe("2");
        });

        it("should handle vendor-prefixed properties", function() {
            // TODO
        });

        it("should handle composite properties", function() {
            expect(link.style("padding")).toBe("5px 5px 5px 5px");
            expect(link.style("margin")).toBe("2px 2px 2px 2px");
            expect(link.style("border-width")).toBe("1px 1px 1px 1px");
            expect(link.style("border-style")).toBe("solid solid solid solid");
        });

        it("should read runtime style property if style doesn't contain any value", function() {
            expect(link.style("font-size")).toBeTruthy();
        });

        it("should fix float property name", function() {
            expect(link.style("float")).toBe("left");
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.style(1); }).toThrow();
        });
    });

    describe("setter", function() {
        it("should return reference to 'this'", function() {
            expect(link.style("color", "white")).toBe(link);
        });

        it("should set style properties", function() {
            expect(link.style("color", "white")._node.style.color).toBe("white");
            expect(link.style("float", "right").style("float")).toBe("right");
        });

        it("should support styles object", function() {
            link.style({color: "white", padding: "5px"});

            expect(link._node.style.color).toBe("white");
            expect(link._node.style.padding).toBe("5px");
        });

        it("should support setting of composite properties", function() {
            var value = "7px";

            link.style("border-width", value);

            expect(link.style("border-left-width")).toBe(value);
            expect(link.style("border-top-width")).toBe(value);
            expect(link.style("border-bottom-width")).toBe(value);
            expect(link.style("border-right-width")).toBe(value);
        });

        it("should support number values", function() {
            link.style("line-height", 7);

            expect(link.style("line-height")).toBe("7");

            link.style("width", 50);

            expect(link.style("width")).toBe("50px");
        });

        it("should handle vendor-prefixed properties", function() {
            var offset = link.offset();

            link.style("box-sizing", "border-box");

            expect(link.offset()).not.toEqual(offset);
        });

        it("should not add px suffix to some css properties", function() {
            var props = "orphans line-height widows z-index".split(" "),
                propName, i, n;

            for (i = 0, n = props.length; i < n; ++i) {
                propName = props[i];

                expect(link.style(propName, 5).style(propName)).not.toBe("5px");
            }
        });

        it("should accept function", function() {
            var spy = jasmine.createSpy("value");

            link.style("line-height", function(value) {
                spy(value);

                expect(this).toBe(link);

                return 7;
            });

            expect(spy).toHaveBeenCalledWith("2");
            expect(link.style("line-height")).toBe("7");
        });

        it("should be suported by collections", function() {
            links.style("float", "right").each(function(el) {
                expect(el.style("float")).toBe("right");
            });
        });

        it("should allow to clear style value", function() {
            expect(link.style("padding", null).style("padding")).toBe("0px 0px 0px 0px");
            expect(link.style("z-index", "").style("z-index")).toBe("auto");
            expect(link.style("float", undefined).style("float")).toBe("none");
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.style(1); }).toThrow();
            expect(function() { link.style("color", "red", "yellow"); }).toThrow();
        });
    });

});