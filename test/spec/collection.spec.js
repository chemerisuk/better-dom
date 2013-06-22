describe("collection", function() {
    "use strict";

    var inputs, spy;
   
    beforeEach(function(){
        setFixtures("<div id='collection'><input><input><input></div>");

        inputs = DOM.findAll("#collection > input");
        spy = jasmine.createSpy("callback");
    });

    it("should allow to execute callback for each element", function() {
        expect(inputs.each(spy)).toBe(inputs);
        expect(spy.callCount).toBe(3);
    });

    // it("should allow to break execution if true was returned", function() {
    //     inputs.each(spy.andReturn(true));
    //     expect(spy.callCount).toBe(1);
    // });

    it("should have shortcut methods", function() {
        var links = DOM.findAll("body"),
            spy = spyOn(links[0], "on"),
            callback = function() {};

        _.forIn(links[0].prototype, function(value, key) {
            if (~("" + value).indexOf("return this;")) {
                expect(typeof links[key]).toBe("function");
            }
        });

        links.on("click", callback, links);
        expect(spy).toHaveBeenCalledWith("click", callback, links);
    });

    // it("should allow to invoke method for each element", function() {
    //     inputs.invoke("on", "focus", spy);

    //     expect(inputs.invoke("fire", "focus"));
    //     expect(spy.callCount).toBe(3);

    //     expect(function() { inputs.invoke(); }).toThrow();
    // });
});
