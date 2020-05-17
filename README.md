# LiteralTextScanner
텍스트 파일의 리터럴 문자열을 검색해서 추출.

예제) 한글이 포함된 리터럴 문자열 부분을 찾아서 추출.
```
node src/app.js scan "C:\git\Moai\GDScripts" --regex "[가-힣]" --output "output.json" --onlytext true
```

결과)
```
["공격력 증가","공격 딜레이 감소","공격시 체력 회복량 증가","회피율 증가","배틀 종료시 체력 회복","배치 가능한 ...", .....]
```