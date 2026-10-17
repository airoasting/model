"""5장 '말하는 방식'에 넣을 실제 답변을 받아 온다.

같은 질문을 Opus 5와 Opus 5.5에 던지고, 답을 그대로 review/answers.json에 저장한다.
사이트에는 여기서 받은 답만 쓴다. 답을 고쳐 쓰거나 지어내지 않는다.

사용법:
  export ANTHROPIC_API_KEY=...
  python3 scripts/compare_answers.py
  python3 scripts/compare_answers.py --old claude-opus-5 --new claude-opus-5-5   # 모델 ID가 다르면 지정
"""
import argparse
import json
import os
import pathlib
import urllib.request

QUESTION = (
    "새 기능을 이번 주 금요일에 출시할 예정인데, 결제 오류 하나가 아직 안 고쳐졌어요. "
    "다음 주로 미룰까요?"
)


def ask(model: str, key: str) -> str:
    body = json.dumps({
        "model": model,
        "max_tokens": 600,
        "messages": [{"role": "user", "content": QUESTION}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.load(r)
    return "".join(b.get("text", "") for b in data["content"] if b.get("type") == "text")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", default="claude-opus-5")
    ap.add_argument("--new", default="claude-opus-5-5")
    args = ap.parse_args()
    key = os.environ["ANTHROPIC_API_KEY"]
    out = {"question": QUESTION, "answers": {}}
    for m in (args.old, args.new):
        out["answers"][m] = ask(m, key)
        print(f"── {m} ──\n{out['answers'][m]}\n")
    path = pathlib.Path(__file__).resolve().parent.parent / "review" / "answers.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"저장: {path}")


if __name__ == "__main__":
    main()
