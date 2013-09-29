Standard DOM APIs have a notion of property and attribute for an element. Usually reading a property is _faster_, but a lot of people don't know that or just always use attributes to keep code the same everywhere.

The library fixes this confusion and introduces _smart_ getter and setter.

    var link = DOM.find("#link");

    // returns value of the id property (i.e. "link" string)
    link.get("id");
    // returns value of the "data-attr" attribute
    link.get("data-attr");
    // returns innerHTML of the element
    link.get();

    // sets property href (and that action updates attribute value too)
    link.set("href", "/some/path");
    // sets the "data-attr" attribute to "123"
    link.set("data-attr", "123");
    // sets innerHTML to "some text"
    link.set("some text");