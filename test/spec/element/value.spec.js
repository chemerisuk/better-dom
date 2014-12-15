describe("value", function() {
  "use strict";

  var div, input;

  beforeEach(function() {
    div = DOM.create("div>a+a");
    input = DOM.create("input[value=foo]");
  });

  it("should replace child element(s) from node with provided element", function() {
    expect(div[0].childNodes.length).toBe(2);
    expect(div.value(DOM.create("b"))).toBe(div);
    expect(div[0].childNodes.length).toBe(1);
    expect(div.child(0)).toHaveTag("b");
  });

  it("should return innerHTML string from node when called with no args", function() {
    expect(div.value()).toBe("<a></a><a></a>");
  });

  it("should set value of text input to provided string value", function () {
    expect(input.value("bar")).toBe(input);
    expect(input[0].value).toBe("bar");
  });

  it("should set value of text input to string value of provided element", function () {
    expect(input.value(DOM.create("div"))).toBe(input);
    expect(input[0].value).toBe("<div>");
    expect(input[0].childNodes.length).toBe(0);
  });

});

