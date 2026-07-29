# ebook

React 19 + TypeScript + Vite 기반 관리자 화면 프로젝트입니다. 기술 스택, 폴더 구조, 화면 규격은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 실행

```bash
npm install
npm run dev
```

## 샘플 화면

- `/userManagement` — 사용자 관리 목록 화면 샘플 (검색 필터 + Ag-Grid 목록 + 등록 모달)

[
{ "id": "dashboard", "label": "대시보드", "path": "/" },
{ "id": "home", "label": "홈", "path": "/" },
{
"id": "user",
"label": "사용자",
"children": [{ "id": "userManagement", "label": "사용자 관리", "path": "/userManagement" }]
},
{
"id": "master",
"label": "기준정보 관리",
"children": [
{
"id": "vendor",
"label": "벤더사 관리",
"children": [
{ "id": "vendorList", "label": "벤더사 관리" },
{ "id": "vendorUser", "label": "벤더사 사용자 관리" },
{ "id": "distributor", "label": "배급사 관리" }
]
},
{ "id": "producer", "label": "제작사 관리" },
{ "id": "program", "label": "프로그램 관리" },
{ "id": "license", "label": "라이선스 관리" }
]
},
{
"id": "system",
"label": "시스템관리",
"children": [
{ "id": "menuManagement", "label": "메뉴 관리", "path": "/menuManagement" },
{ "id": "roleManagement", "label": "역할 관리", "path": "/roleManagement" },
{ "id": "commonCode", "label": "공통관리", "path": "/commonCodeManagement" }
]
}
]
