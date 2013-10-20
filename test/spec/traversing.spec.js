describe("traversing", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<div><b></b><b></b><i></i><a id='test'><strong></strong><em></em></a><b></b><i></i><i></i></div>");

        link = DOM.find("#test");
    });

    describe("next, prev, parent", function() {
        it("should return an appropriate element", function() {
            var expectedResults = {
                    next: "b",
                    prev: "i",
                    parent: "div"
                };

            _.forOwn(expectedResults, function(tagName, methodName) {
                expect(link[methodName]()._node).toHaveTag(tagName);
            });
        });

        it("should search for the first matching element if selector exists", function() {
            expect(link.next("i")._node).toHaveTag("i");
            expect(link.prev("b")._node).toHaveTag("b");
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

            _.forOwn(expectedResults, function(tagName, methodName) {
                _.each(link[methodName](), isOK(methodName));
            });
        });

        it("should filter matching elements by optional selector", function() {
            var filters = {
                    children: "em",
                    nextAll: "i",
                    prevAll: "i"
                },
                haveTag = function(tagName) {
                    return function(el) {
                        expect(el._node).toHaveTag(tagName);
                    };
                };

            _.forOwn(filters, function(tagName, methodName) {
                _.each(link[methodName](tagName), haveTag(tagName));
            });
        });
    });

    describe("child", function() {

        it("should accept optional filter", function() {
            expect(link.child(0)._node).toHaveTag("strong");
            expect(link.child(0, "a")._node).toBeFalsy();
        });

        it("should throw error if the first arg is not a number", function() {
            expect(function() { link.child({}); }).toThrow();
        });

    });

});