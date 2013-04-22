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

            Object.keys(expectedResults).forEach(function(methodName) {
                expect(link[methodName]()._node).toMatchSelector(expectedResults[methodName]);
            });
        });

        it("should search for the first matching element if selector exists", function() {
            expect(link.next("i")._node).toMatchSelector("i");
            expect(link.prev("b")._node).toMatchSelector("b");
            expect(link.firstChild("b")._node).toBeNull();
            expect(link.lastChild("em")._node).toMatchSelector("em");
            expect(link.parent("body")._node).toMatchSelector("body");
        });
    });

    describe("children, nextAll, prevAll", function() {
        it("should return an appropriate collection of elements", function() {
            var expectedResults = {
                children: "strong em".split(" "),
                nextAll: "b i i".split(" "),
                prevAll: "i b b".split(" ")
            };

            Object.keys(expectedResults).forEach(function(methodName) {
                link[methodName]().each(function(el, index) {
                    expect(el._node).toMatchSelector(expectedResults[methodName][index]);
                });
            });
        });

        it("should filter matching elements by optional selector", function() {
            var filters = {
                children: "em",
                nextAll: "i",
                prevAll: "i"
            };

            Object.keys(filters).forEach(function(methodName) {
                var selector = filters[methodName];

                link[methodName](selector).each(function(el, index) {
                    expect(el._node).toMatchSelector(selector);
                });
            });
        });  
    });

});