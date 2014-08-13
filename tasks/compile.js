var path = require("path");
var es6tr = require("es6-transpiler");

var es6modules = require("es6-module-transpiler");
var recast = require("es6-module-transpiler/node_modules/recast");

var Container = es6modules.Container;
var FileResolver = es6modules.FileResolver;
var BundleFormatter = es6modules.formatters.bundle;


module.exports = function(grunt) {
    grunt.task.registerMultiTask("compile", function() {
        var outputFile = this.data.dest;

        var container = new Container({
                resolvers: [ new FileResolver( [this.data.cwd || "./"] ) ],
                formatter: new BundleFormatter()
            });

        this.filesSrc.forEach(function(filename) {
            container.getModule(filename);
        });

        var ast = container.convert();
        var code = recast.print(ast[0]).code;

        grunt.config.set("filename", path.basename(outputFile));

        var options = this.options();

        if (options.banner) code = options.banner + "\n" + code;

        grunt.file.mkdir(path.dirname(outputFile));

        var result = es6tr.run({
                src: code,
                globals: {DOM: true},
                outputFilename: outputFile,
                environments: ["browser"]
            });

        if (result.errors.length > 0) {
            grunt.fail.fatal("\n" + result.errors.join("\n"));

            grunt.file.write(outputFile, code);
        }
    });
};
