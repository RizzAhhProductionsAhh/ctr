#!/usr/bin/env node

import { exec } from "child_process"
import { readdirSync, readdir, statSync, readFile, writeFile, unlink, existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, rmdirSync } from "fs"
import {compile} from "@danielx/civet"
import * as path from "path"

if(!existsSync("./ctr.json")) writeFileSync("./ctr.json", JSON.stringify({}))
const jsonData = JSON.parse(readFileSync("./ctr.json" , {encoding: 'utf8'}))

let civetDir = process.argv[2] as string
let compileDir = process.argv[3] as string

if(!civetDir || !compileDir) {
    console.log("Expected usage `node ctr.js ./path/to/civet ./path/to/output`");
    process.exit(1);
}

compileDir = compileDir.replaceAll("\\", "/")
civetDir = civetDir.replaceAll("\\", "/")


console.log(civetDir , compileDir)
//probably better way to do this but idk
if(civetDir.startsWith("./")) {
    civetDir = civetDir.slice(2, civetDir.length)
}
if(civetDir.startsWith("/")) {
    civetDir = civetDir.slice(1, civetDir.length)
}
if(compileDir.startsWith("./")) {
    compileDir = compileDir.slice(2, compileDir.length)
}
if(compileDir.startsWith("/")) {
    compileDir = compileDir.slice(1, compileDir.length)
}


let oldCivetD: {dirs: string[], files: string[]} =  {dirs: [], files :[]}

if(jsonData[civetDir] && jsonData[civetDir][compileDir]) oldCivetD = jsonData[civetDir][compileDir]

//oldCivetD: {dirs: string[], files: string[]} .= jsonData[civetDir][compileDir] || {dirs:[], files: []}
let newCivetD: {dirs: string[], files: string[]} = {dirs: [], files: []}

let currentSubDir = "/"

function handleFile (pathh: string) {
    newCivetD.files.push(pathh)
    let t = pathh.split("/")
    t.shift()
    t.pop()
    const targetDir = t.join("/")

    let contents = readFileSync(pathh, {encoding: 'utf8'}) 
    contents = contents.replace(".civet", "")
    const x = pathh.split("/")
    const fileName = x.pop().split(".")[0]


    const compiled = compile(contents)

    let p = x.join("/")
    p = p.replace(civetDir, compileDir)

    if(!existsSync(p)) mkdirSync(p)

    console.log("Outputting", pathh, "to", p)

    return writeFile(p + `/${fileName}.ts`, compiled, function(err) {
        if(err) throw err
        return       
    })
}


function handleDir (dir: string): void {
    newCivetD.dirs.push(dir)
    readDirF(dir, false)
}


function readDirF (dir: string, x: boolean) {
    const files = readdirSync(dir)

    const results=[];for(let i = 0; i < files.length; i++) {
        const file = files[i]
        const pathh = path.join(dir, file).replaceAll("\\", "/")

        const stat = statSync(pathh)
        if (stat.isFile()) {
            results.push(handleFile(pathh))
        }
        else if (stat.isDirectory()) {
            results.push(handleDir(pathh))
        } else {
 results.push(undefined)
 }
    };return results;
}

readDirF(civetDir, true)



oldCivetD.files.forEach(function(file: string) {
    if(!newCivetD.files.includes(file)) {
        let rep = file.replace(civetDir,compileDir).replace(".civet", ".ts")

        if(existsSync(rep)) {
            unlinkSync(rep)
            return console.log(`Deleted file ${rep}`)
        }
        return
    }
    return
})

oldCivetD.dirs.forEach(function(dir: string) {
    if(!newCivetD.dirs.includes(dir)) {
        let rep = dir.replace(civetDir, compileDir)
        if(existsSync(rep)) {
            rmdirSync(rep)
            return console.log(`Deleted dir ${rep}`)
        }
        return
    }
    return
})

jsonData[civetDir] = {[compileDir]: {}}
jsonData[civetDir][compileDir] = newCivetD

writeFileSync("./ctr.json", JSON.stringify(jsonData))


