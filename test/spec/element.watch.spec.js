describe("watch", function() {
    var link;

    beforeEach(function() {
        link = DOM.create("a[href=url title=text]");
    });

    it("should execute callback after the setter call", function() {
        var spy1 = jasmine.createSpy("watcher1"),
            spy2 = jasmine.createSpy("watcher2"),
            oldHref = link.get("href");

        expect(link.watch("href", spy1)).toBe(link);
        expect(link.watch("title", spy2)).toBe(link);

        link.set("href", "url_changed");
        expect(spy1).toHaveBeenCalledWith("href", "url_changed", oldHref);
        expect(spy2).not.toHaveBeenCalled();

        link.set("title", "modified");
        expect(spy2).toHaveBeenCalledWith("title", "modified", "text");
        expect(spy1.callCount).toBe(1);

        link.set("123");
        expect(spy1.callCount).toBe(1);
        expect(spy1.callCount).toBe(1);

        link.set("title", "new");
        expect(spy2).toHaveBeenCalledWith("title", "new", "modified");
    });
});
