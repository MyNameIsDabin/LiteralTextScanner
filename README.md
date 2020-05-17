# LiteralTextScanner
텍스트 파일의 리터럴 문자열을 검색해서 추출, 특정 문자열로 대체 할 수 있는 프로그램

- 정규식으로 원하는 문자열이 포함된 리터럴만 탐색 가능

```
node src/app.js scan "C:\git\Moai\GDScripts" "/[가-힣]/" --g true
```
