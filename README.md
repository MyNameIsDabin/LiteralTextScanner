# LiteralTextScanner
텍스트 파일의 리터럴 문자열을 검색해서 추출.

예제) 한글이 포함된 리터럴 문자열 부분을 찾아서 추출.
```
node src/app.js scan "C:\git\Moai\GDScripts, C:\git\Moai\Scenes" --ext "gd, tscn" --regex "[가-힣]" --output "output.json" --onlytext false
```

결과) onlytext 옵션이 true 인 경우
```
[{
    "C:\\git\\Moai\\GDScripts\\BabyMoaiUpgradeManager.gd": [{
        "line": 6,
        "text": "공격력 증가"
    }, {
        "line": 7,
        "text": "공격 딜레이 감소"
    },
    //...중략
}]
```

결과) onlytext 옵션이 false 인 경우
```
["공격력 증가","공격 딜레이 감소","공격시 체력 회복량 증가","회피율 증가","배틀 종료시 체력 회복","배치 가능한 ...", .....]
```