describe("traversing", function() {
    var link;

    beforeEach(function() {
        setFixtures("<div><b></b><b></b><i></i><a id='test'><strong></strong><em></em></a><b></b><i></i><i></i></div>");

        link = DOM.find("#test");
    });

    describe("firstChild, lastChild, next, prev, parent", function() {
        it("should return an appropriate element", function() {
            var expectedResults = {
                firstChild: "strong",
                lastChild: "em",
                next: "b",
                prev: "i",
                parent: "div"
            };

            for (var methodName in expectedResults) {
                expect(link[methodName]()._node).toHaveTag(expectedResults[methodName]);
            }
        });

        it("should search for the first matching element if selector exists", function() {
            expect(link.next("i")._node).toHaveTag("i");
            expect(link.prev("b")._node).toHaveTag("b");
            expect(link.firstChild("b")._node).toBeNull();
            expect(link.lastChild("em")._node).toHaveTag("em");
            expect(link.parent("body")._node).toHaveTag("body");
        });
    });

    describe("children, nextAll, prevAll", function() {
        it("should return an appropriate collection of elements", function() {
            var expectedResults = {
                    children: "strong em".split(" "),
                    nextAll: "b i i".split(" "),
                    prevAll: "i b b".split(" ")
                },
                isOK = function(methodName) {
                    return function(el, index) {
                        expect(el._node).toHaveTag(expectedResults[methodName][index]);
                    };
                };

            for (var methodName in expectedResults) {
                link[methodName]().each(isOK(methodName));
            }
        });

        it("should filter matching elements by optional selector", function() {
            var filters = {
                    children: "em",
                    nextAll: "i",
                    prevAll: "i"
                },
                haveTag = function(tagName) {
                    return function(el, index) {
                        expect(el._node).toHaveTag(tagName);
                    };
                };

            for (var methodName in filters) {
                var tagName = filters[methodName];
                
                link[methodName](tagName).each(haveTag(tagName));
            }
        });  
    });

});