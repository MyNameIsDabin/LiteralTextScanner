const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const argv = require('yargs')
    .command('scan [dir] [options]', '파일 내 텍스트를 추출합니다', (yargs) => {
        yargs
            .positional('dir', {
                describe: '추출할 디렉토리 (, 로 구분)'
            })
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        description: '추출할 JSON 파일명'
    })
    .option('regex', {
        alias: 'r',
        type: 'string',
        description: '정규식으로 찾기'
    })
    .option('ext', {
        alias: 'e',
        type: 'string',
        description: '탐색할 파일의 확장자 (, 로 구분)'
    })
    .option('onlytext', {
        alias: 't',
        type: 'boolean',
        description: '텍스트 배열로만 뽑기'
    })
    .argv;

const DEFAULT_JSON_FILE_NAME = "output.json";

const readFileContents = async (dir, extList) => {
    const bufferToString = (buffer) => buffer.toString().split('\n');
    const filePath = (dir, fileName) => path.join(dir, fileName);
    const files = await fsPromises.readdir(dir, { withFileTypes: true });
    const fileNames = files
        .filter((dirent) => !extList || extList.includes(path.extname(dirent.name).replace(".", "")))
        .map((dirent) => dirent.name);
    const direNames = files
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    const fileDataDirectory = await Promise.all(direNames.map((direName) => readFileContents(path.join(dir, direName), extList)));
    const buffers = await Promise.all(fileNames.map((fileName) => fsPromises.readFile(filePath(dir, fileName))));
    const fileDataList = fileNames.map((fileName, index) => ({
        'filePath': filePath(dir, fileName),
        'contents': bufferToString(buffers[index])
    }));
    return fileDataList.concat(...fileDataDirectory);
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

const fileContentsToJSONArray = (fileContents, regex, isOnlyText) => {
    const jsonArr = [];
    const textArr = [];
    fileContents.forEach(({
        filePath,
        contents
    }) => {
        const data = {
            [filePath]: []
        };
        contents.forEach((line, index) => {
            const findTextList = findLiteralTextList(line, regex);
            const contentsList = findTextList.map((text) => ({
                "line": index + 1,
                "text": text
            }));
            if (findTextList && findTextList.length > 0) {
                data[filePath].push(...contentsList);
                textArr.push(...contentsList.map(({
                    text
                }) => text));
            };
        });
        if (data[filePath] && data[filePath].length > 0) {
            jsonArr.push(data);
        }
    });

    return isOnlyText ? textArr : jsonArr;
}

const trim = (text) => text.replace(/\s/gi, "");

if (argv.dir) {
    const argvList = (argvs) => argvs.split(",").map(argv => trim(argv));
    const dirList = argv.dir && argvList(argv.dir);
    const extList = argv.ext && argvList(argv.ext);
    const regExp = new RegExp(argv.regex);
    regExp.global = argv.global || false;
    (async () => {
        const jsonArr = (await Promise.all(dirList.map(async (dir) => {
            const fileContents = await readFileContents(dir, extList);
            return fileContentsToJSONArray(fileContents, regExp, argv.onlytext);
        }))).reduce((lc, rc) => lc.concat(rc));

        await fsPromises.writeFile(path.join(argv.output || DEFAULT_JSON_FILE_NAME), JSON.stringify(jsonArr));
        console.log("추출 완료");
    })();
}