#!/usr/bin/env node
"use strict";
var _a;
exports.__esModule = true;
var fs_1 = require("fs");
var civet_1 = require("@danielx/civet");
var path = require("path");
if (!(0, fs_1.existsSync)("./ctr.json"))
    (0, fs_1.writeFileSync)("./ctr.json", JSON.stringify({}));
var jsonData = JSON.parse((0, fs_1.readFileSync)("./ctr.json", { encoding: 'utf8' }));
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
var oldCivetD = { dirs: [], files: [] };
if (jsonData[civetDir] && jsonData[civetDir][compileDir])
    oldCivetD = jsonData[civetDir][compileDir];
//oldCivetD: {dirs: string[], files: string[]} .= jsonData[civetDir][compileDir] || {dirs:[], files: []}
var newCivetD = { dirs: [], files: [] };
var currentSubDir = "/";
function handleFile(pathh) {
    newCivetD.files.push(pathh);
    var t = pathh.split("/");
    t.shift();
    t.pop();
    var targetDir = t.join("/");
    var contents = (0, fs_1.readFileSync)(pathh, { encoding: 'utf8' });
    contents = contents.replace(".civet", "");
    var x = pathh.split("/");
    var fileName = x.pop().split(".")[0];
    var compiled = (0, civet_1.compile)(contents);
    var p = x.join("/");
    p = p.replace(civetDir, compileDir);
    if (!(0, fs_1.existsSync)(p))
        (0, fs_1.mkdirSync)(p);
    console.log("Outputting", pathh, "to", p);
    return (0, fs_1.writeFile)(p + "/".concat(fileName, ".ts"), compiled, function (err) {
        if (err)
            throw err;
        return;
    });
}
function handleDir(dir) {
    newCivetD.dirs.push(dir);
    readDirF(dir, false);
}
function readDirF(dir, x) {
    var files = (0, fs_1.readdirSync)(dir);
    var results = [];
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var pathh = path.join(dir, file).replaceAll("\\", "/");
        var stat = (0, fs_1.statSync)(pathh);
        if (stat.isFile()) {
            results.push(handleFile(pathh));
        }
        else if (stat.isDirectory()) {
            results.push(handleDir(pathh));
        }
        else {
            results.push(undefined);
        }
    }
    ;
    return results;
}
readDirF(civetDir, true);
oldCivetD.files.forEach(function (file) {
    if (!newCivetD.files.includes(file)) {
        var rep = file.replace(civetDir, compileDir).replace(".civet", ".ts");
        if ((0, fs_1.existsSync)(rep)) {
            (0, fs_1.unlinkSync)(rep);
            return console.log("Deleted file ".concat(rep));
        }
        return;
    }
    return;
});
oldCivetD.dirs.forEach(function (dir) {
    if (!newCivetD.dirs.includes(dir)) {
        var rep = dir.replace(civetDir, compileDir);
        if ((0, fs_1.existsSync)(rep)) {
            (0, fs_1.rmdirSync)(rep);
            return console.log("Deleted dir ".concat(rep));
        }
        return;
    }
    return;
});
jsonData[civetDir] = (_a = {}, _a[compileDir] = {}, _a);
jsonData[civetDir][compileDir] = newCivetD;
(0, fs_1.writeFileSync)("./ctr.json", JSON.stringify(jsonData));
