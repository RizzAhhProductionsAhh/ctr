import { exec } from "child_process"
import { readdir, stat } from "fs"
import * as path from "path"


const civetDir = "./civet"
const compileDir = "./src"
let currentSubDir = "/"

function handleFile (pathh) {
    let t = pathh.split("\\")
    t.shift()
    t.pop()
    const targetDir = t.join("/")

    return exec(`civet -c ${pathh} -o ${compileDir}/${targetDir}.ts`, function(err,out) {
        if(err) throw err
        return
    })
}


function handleDir (dir) {
    console.log("Entering Sub Dir", dir)
    readDirF(dir)
}


function readDirF (dir) {
    return readdir(dir, function(err,files) {
        return files.forEach(function(file) { 
            const pathh = path.join(dir, file)

            return stat(pathh, function(err,stat) { 
                if(stat.isFile()) {
                    return handleFile(file)
                }
                else if (stat.isDirectory()) {
                    return handleDir(file)
                }
 return
            }
            )
        }

        )
    
    })
}



readDirF(civetDir)
