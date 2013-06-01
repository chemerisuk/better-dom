basePath = "../..";

frameworks = ["jasmine"];

browsers = ["PhantomJS"];

files = [
    JASMINE,
    JASMINE_ADAPTER,
    "test/lib/jasmine-dom/*.js",
    "components/lodash/lodash.js",
    "src/*.js",
    "test/spec/*.spec.js"
];
