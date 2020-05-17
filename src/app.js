const fs = require('fs');
const path = require('path');
const argv = require('yargs')
    .command('pullout [dir] [options]', '파일 내 한글을 추출합니다', (yargs) => {
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
    
const fileSheet = [];
const regExp = new RegExp(argv.regex);
regExp.global = argv.global || false;
try {
    const files = fs.readdirSync(argv.dir);
    files.forEach((filename)=>{
        const textSheet = [];
        const filepath = path.join(argv.dir, filename);
        var lines = require('fs').readFileSync(filepath, 'utf-8').split('\n').filter(Boolean);
        lines.forEach((line, lineNum)=>{
            const pullOutText = line.match(regExp);
            if (pullOutText) {
                pullOutText.forEach((sentence)=>{
                    textSheet.push({
                        "line": lineNum,
                        "text": sentence
                    });
                });
            }
        });
        if (textSheet.length > 0) {
            fileSheet.push({
                "file": filename,
                "textSheet": textSheet
            });
        } else {
            console.log(`${filename} 파일에서는 추출할 텍스트가 없습니다`)
        }
    });
} catch (err) {
    console.log(err.message)
}

fs.writeFileSync("pullout.json", JSON.stringify(fileSheet));
console.log("추출 완료");