Multilanguage support is often required for an extension. `DOM.importStrings` allows to add a localized string which may be displayed in a html element using `data-i18n` attribute with the appropriate key.

    DOM.importStrings("hello.0", "Hello!");
    // NOTICE: optional parameter to specify language of the string
    DOM.importStrings("hello.0", "Привет!", "ru");
    // element <span data-i18n="hello.0"><span> will display "Hello!"

You can use parametrized strings via special `{param}` substrings and appropriate `data-*` attributes.

    DOM.importStrings("hello.1", "Hello {user}!");
    // element <a data-i18n="hello.1" data-user="Maksim"></a> will display "Hello Maksim!"

To change a string language manually use setter with `lang` parameter.

    span.set("lang", "ru");
    // now the span displays "Привет!"
    DOM.find("html").set("lang", "ru");
    // the line changes language globally

### Behind the scenes
All strings are actually stored in css and `:before` pseudoelement is used to display them. So the code above actually create several css rules below:

    [data-i18n="hello.0"]:before {content: "Hello!"}
    [data-i18n="hello.0"]:lang(ru):before {content: "Привет!"}
    [data-i18n="hello.1"]:before {content: "Hello " attr(data-user) "!"}
