basePath = "../..";

frameworks = ["jasmine"];

browsers = ["PhantomJS"];

files = [
    JASMINE,
    JASMINE_ADAPTER,
    "test/lib/jasmine-dom/*.js",
    "src/*.js",
    "test/spec/*.js"
];
