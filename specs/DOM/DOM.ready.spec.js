describe("DOM", function() {
	describe("DOM.ready", function() {

		it("should immidiately execute after DOMContentLoaded is fired", function() {
			var foo = { bar: function() {} };

			spyOn(foo, "bar");

			DOM.ready(foo.bar);

			expect(foo.bar).toHaveBeenCalled();
		});

	});
});