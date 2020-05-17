const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const argv = require('yargs')
    .command('pullout [dir]', '파일 내 한글을 추출합니다', (yargs) => {
        yargs
            .positional('dir', {
                describe: '추출할 디렉토리 or 파일 경로'
            })
    }, (argv) => {
        if (!argv.dir) {
            console.info("pullout [dir] [regex]")
            console.info("[dir] 추출할 디렉토리 or 파일 경로 누락됨")
            process.exit()
        }
    })
    .argv;

const readFileContents = async (dir) => {
    const bufferToString = (buffer) => buffer.toString().split('\n');
    const filePath = (dir, fileName) => path.join(dir, fileName);
    const files = await fsPromises.readdir(dir);
    const buffers = await Promise.all(files.map((fileName) => fsPromises.readFile(filePath(dir, fileName))));
    const fileDatas = files.map((fileName, index) => ({'fileName': fileName, 'contents': bufferToString(buffers[index])}));
    return fileDatas;
};

const findLiteralTextList = (text, regex) => {
    const covers = ["\'", "\""];
    const findTextList = [];
    let pivot = covers[0];
    while (pivot = covers.find((cover)=>text.includes(cover))) {
        const startIndex = text.indexOf(pivot);
        text = text.substr(startIndex+1);
        const endIndex = text.indexOf(pivot);
        const findText = text.substr(0, endIndex);
        text = text.substr(endIndex+1);
        if (!regex || regex.test(findText)) {
            findTextList.push(findText);
        }
    }
    return findTextList;
};

if (argv.dir) {
    (async () => {
        const fileContents = await readFileContents(argv.dir);
        fileContents.forEach(({fileName, contents})=>{
            contents.forEach((line)=>{
                const koreanContents = findLiteralTextList(line, /[가-힣]/g);
                if (koreanContents && koreanContents.length > 0) {
                    console.log(koreanContents);
                };
            })
        });
    })();
}

// const fileSheet = [];
// try {
//     const files = fs.readdirSync(argv.dir);
//     files.forEach((filename)=>{
//         const textSheet = [];
//         const filepath = path.join(argv.dir, filename);
//         var lines = require('fs').readFileSync(filepath, 'utf-8').split('\n').filter(Boolean);
//         lines.forEach((line, lineNum)=>{
//             const startsWith = ["\'", "\""]
//             const pullOutText = line.startsWith("\'") || line.startsWith("\'")
//             if (pullOutText) {
//                 pullOutText.forEach((sentence)=>{
//                     textSheet.push({
//                         "line": lineNum,
//                         "text": sentence
//                     });
//                 });
//             }
//         });
//         if (textSheet.length > 0) {
//             fileSheet.push({
//                 "file": filename,
//                 "textSheet": textSheet
//             });
//         } else {
//             console.log(`${filename} 파일에서는 추출할 텍스트가 없습니다`)
//         }
//     });
// } catch (err) {
//     console.log(err.message)
// }

// fs.writeFileSync("pullout.json", JSON.stringify(fileSheet));
// console.log("추출 완료");