const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const argv = require('yargs')
    .command('scan [dir] [options]', '파일 내 텍스트를 추출합니다', (yargs) => {
        yargs
            .positional('dir', {
                describe: '추출할 디렉토리 or 파일 경로'
            })
    })
    .option('json', {
        alias: 'j',
        type: 'string',
        description: 'json 파일로 추출할 파일명'
    })
    .option('regex', {
        alias: 'r',
        type: 'string',
        description: '정규식으로 찾기'
    })
    .option('global', {
        alias: 'g',
        type: 'boolean',
        description: '정규식 글로벌 적용여부'
    })
    .argv;

const readFileContents = async (dir) => {
    const bufferToString = (buffer) => buffer.toString().split('\n');
    const filePath = (dir, fileName) => path.join(dir, fileName);
    const files = await fsPromises.readdir(dir);
    const buffers = await Promise.all(files.map((fileName) => fsPromises.readFile(filePath(dir, fileName))));
    const fileDatas = files.map((fileName, index) => {
        return {
            'filePath': filePath(dir, fileName),
            'contents': bufferToString(buffers[index])
        }
    });
    return fileDatas;
};

const findLiteralTextList = (text, regex) => {
    const covers = ["\'", "\""];
    const findTextList = [];
    let pivot = covers[0];
    while (pivot = covers.find((cover) => text.includes(cover))) {
        const startIndex = text.indexOf(pivot);
        text = text.substr(startIndex + 1);
        const endIndex = text.indexOf(pivot);
        const findText = text.substr(0, endIndex);
        text = text.substr(endIndex + 1);
        if (!regex || regex.test(findText)) {
            findTextList.push(findText);
        }
    }
    return findTextList;
};

const fileContentsToJSONArray = (fileContents, regex) => {
    const jsonArr = [];
    fileContents.forEach(({
        filePath,
        contents
    }) => {
        contents.forEach((line) => {
            const findTextList = findLiteralTextList(line, regex);
            const contentsList = findTextList.map((text)=>({"line":line, "text":text}));
            if (findTextList && findTextList.length > 0) {
                jsonArr.push({
                    "filePath": filePath,
                    "contents": contentsList
                });
            };
        })
    });
    return jsonArr;
}

if (argv.dir) {
    const regExp = new RegExp(argv.regex);
    regExp.global = argv.global || false;
    (async () => {
        const fileContents = await readFileContents(argv.dir);
        console.log(fileContentsToJSONArray(fileContents, regExp));
    })();
}
// fs.writeFileSync("pullout.json", JSON.stringify(fileSheet));
// console.log("추출 완료");