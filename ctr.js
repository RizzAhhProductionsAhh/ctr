"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var civet_1 = require("@danielx/civet");
var path = require("path");
var civetDir = process.argv[2];
var compileDir = process.argv[3];
if (!civetDir || !compileDir) {
    console.log("Expected usage `node ctr.js ./path/to/civet ./path/to/output`");
    process.exit(1);
}
compileDir = compileDir.replaceAll("\\", "/");
civetDir = civetDir.replaceAll("\\", "/");
console.log(civetDir, compileDir);
//probably better way to do this but idk
if (civetDir.startsWith("./")) {
    civetDir = civetDir.slice(2, civetDir.length);
}
if (civetDir.startsWith("/")) {
    civetDir = civetDir.slice(1, civetDir.length);
}
if (compileDir.startsWith("./")) {
    compileDir = compileDir.slice(2, compileDir.length);
}
if (compileDir.startsWith("/")) {
    compileDir = compileDir.slice(1, compileDir.length);
}
var currentSubDir = "/";
function handleFile(pathh) {
    var t = pathh.split("/");
    t.shift();
    t.pop();
    var targetDir = t.join("/");
    return (0, fs_1.readFile)(pathh, 'utf8', function (err, contents) {
        console.log("Contents ".concat(contents));
        contents = contents.replace(".civet", "");
        console.log("New Contents ".concat(contents));
        var x = pathh.split("/");
        var fileName = x.pop().split(".")[0];
        var compiled = (0, civet_1.compile)(contents);
        var p = x.join("/");
        console.log(p);
        p = p.replace(civetDir, compileDir);
        console.log(p);
        if (!(0, fs_1.existsSync)(p))
            (0, fs_1.mkdirSync)(p);
        console.log("Outputting", pathh, "to", p);
        return (0, fs_1.writeFile)(p + "/".concat(fileName, ".ts"), compiled, function (err) {
            if (err)
                throw err;
            return;
        });
    });
}
function handleDir(dir) {
    console.log("Entering Sub Dir", dir);
    readDirF(dir);
}
function readDirF(dir) {
    return (0, fs_1.readdir)(dir, function (err, files) {
        return files.forEach(function (file) {
            var pathh = path.join(dir, file).replaceAll("\\", "/");
            return (0, fs_1.stat)(pathh, function (err, stat) {
                if (stat.isFile()) {
                    return handleFile(pathh);
                }
                else if (stat.isDirectory()) {
                    return handleDir(pathh);
                }
                return;
            });
        });
    });
}
readDirF(civetDir);
