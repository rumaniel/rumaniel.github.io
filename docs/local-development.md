# 로컬 개발 가이드

## 사전 준비

- Ruby 3.2+ (Windows는 RubyInstaller 권장)
- Bundler

## 설치

```bash
bundle install
```

## 로컬 실행

```bash
bundle exec jekyll serve
```

## 로컬 빌드

```bash
bundle exec jekyll build
```

## 참고

- `baseurl` 을 로컬에서 무시하려면 아래처럼 실행

```bash
bundle exec jekyll serve --baseurl=""
```
