import { exec } from "child_process"
import { readdir, stat, readFile, writeFile, unlink, existsSync, mkdirSync } from "fs"
import {compile} from "@danielx/civet"
import * as path from "path"


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

let currentSubDir = "/"

function handleFile (pathh: string) {
    let t = pathh.split("/")
    t.shift()
    t.pop()
    const targetDir = t.join("/")

    return readFile(pathh, 'utf8', function(err, contents) {
        console.log(`Contents ${contents}`)
        contents = contents.replace(".civet", "")
        console.log(`New Contents ${contents}`)
        const x = pathh.split("/")
        const fileName = x.pop().split(".")[0]


        const compiled = compile(contents)

        let p = x.join("/")
        console.log(p) 
        p = p.replace(civetDir, compileDir)
        console.log(p)

        if(!existsSync(p)) mkdirSync(p)

        console.log("Outputting", pathh, "to", p)

        return writeFile(p + `/${fileName}.ts`, compiled, function(err) {
            if(err) throw err
            return
            
        })
    })
}


function handleDir (dir: string): void {
    console.log("Entering Sub Dir", dir)
    readDirF(dir)
}


function readDirF (dir: string) {
    return readdir(dir, function(err,files) {
        return files.forEach(function(file) { 
            const pathh = path.join(dir, file).replaceAll("\\", "/")

            return stat(pathh, function(err,stat) { 
                if(stat.isFile()) {
                    return handleFile(pathh)
                }
                else if (stat.isDirectory()) {
                    return handleDir(pathh)
                }
 return
            }
            )
        }

        )
    
    })
}



readDirF(civetDir)
