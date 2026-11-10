# SOL — Ideas into existence.

GPT-6.1 Sol을 소개하는 한국어 인터랙티브 웹사이트입니다. 별도 라이브러리나 설치 없이 HTML, CSS, JavaScript로 동작합니다.

## 열기

`index.html`을 브라우저에서 직접 열거나, 이 폴더에서 아래 명령을 실행합니다.

```sh
npm start
```

주소: http://127.0.0.1:4361

배포용 파일은 `npm run build`로 `dist/`에 복사합니다. 내용 수정은 루트의 `index.html`, `style.css`, `app.js`에서 진행합니다.

## 구성과 동작

- 생성한 액체 크롬 아트, 미세한 입자, 마우스 시차 효과가 있는 첫 화면
- 자기소개, 세 가지 작업 가능성, 전환 가능한 작업 예시
- 키보드 방향키로 이동하는 작업실 탭, 데모 다시 보기, 요청 복사
- 데스크톱과 모바일 레이아웃, 모바일 메뉴, 읽기 진행 표시
- 모션 켜기/끄기, 시스템의 줄어든 동작 설정 반영
- 스크롤에 연동되는 메인 아트의 회전·확대, 문장 강조, 입체 카드 등장, 배너 이동
- 충분히 넓고 높은 화면에서는 작업실이 고정되고 스크롤로 세 예시가 전환됩니다. 탭과 키보드 선택도 사용할 수 있습니다.
- 모바일과 작은 화면은 일반 스크롤을 유지합니다. 모션을 끄면 고정 장면과 스크롤 애니메이션이 해제됩니다.

작업실은 미리 작성한 예시입니다. AI API에 연결하거나 요청을 전송하지 않습니다. 외부 시작 링크는 실제 Codex로 연결됩니다.

OpenAI의 공식 사이트가 아닌 독립적인 자기소개 콘셉트입니다. Codex 소개 참고: https://developers.openai.com/api/docs/guides/code-generation (2026-10-02 확인). 특정 모델의 성능 수치나 가격을 주장하지 않습니다.

## 메인 이미지

파일: `assets/sol-chrome.png` (1024 × 1024). 내장 이미지 생성 도구로 한 번 생성한 원본 아트입니다.

사용한 최종 프롬프트:

```text
Use case: stylized-concept
Asset type: square hero artwork for a premium Korean self-introduction website, displayed around 640 px wide.
Primary request: sculptural solar intelligence expressed as one extraordinary iridescent liquid-chrome ring, a twisted torus around a dark central opening, with a glossy flowing ribbed structure like a luminous energy bloom.
Scene/backdrop: dramatic near-black #08090d studio void, smooth deep-black background, opaque black background.
Subject: a single isolated twisted torus with flowing metallic ribs, no other objects.
Style/medium: premium photorealistic CGI product art, high contrast, crisp intricate details, realistic liquid metallic refractive material.
Composition/framing: square 1024x1024 or 1536x1536 image; full object central; camera slightly oblique three-quarter view; generous dark margins of about 12% on every edge, no crop.
Lighting/mood: luminous rim highlights, glossy reflections, dramatic sculptural studio lighting, deep dark core and clean dark perimeter that smoothly blends to black.
Color palette: electric cobalt blue, vivid ultraviolet, rose and magenta, a small touch of molten amber.
Constraints: exactly one ring-like sculptural object; retain a clear dark center; black background, not transparent; no stars, text, typography, interface, logos, watermark.
```


## 2026-10-03 인터랙션 업데이트

`assets/sol-chrome.png` 한 장과 하나의 DOM 오브제가 첫 화면부터 마지막 장면까지 이어집니다. 스크롤에 맞춰 위치·크기·회전을 보간하고, 마우스 드래그·방향키·터치로 링을 회전합니다. 작업 예시와 비교 항목 선택은 링의 색에 반영됩니다. 기본 스크롤과 모션 끄기, 시스템의 모션 감소 설정을 지원합니다.

벤치마크 탐색기는 공식 문서의 입력/출력 단가와 컨텍스트를 비교하며, 토큰 슬라이더로 Standard 비캐시 텍스트 요청 비용을 계산합니다. 비용 예시는 추론 토큰을 출력에 포함하고 도구·지역 할증·세금을 제외합니다. 입력은 250K 이하로 제한하므로 장문 할증 구간에 진입하지 않습니다. 성능 평가 점수는 확인한 공식 자료에서 찾지 못했으므로 숫자를 주장하지 않고 확인 대기로 표시합니다.

검증 출처 (2026-10-03):
- https://developers.openai.com/api/docs/models/gpt-6.1-sol
- https://developers.openai.com/api/docs/models/gpt-6-astra
- https://developers.openai.com/api/docs/guides/latest-model
