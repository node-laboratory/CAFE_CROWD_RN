<div align="center">

# ☕ 카페붐빔 (Cafe Crowd)

**내 주변 카페가 한산한지 한 눈에**
Apps-in-Toss 미니앱으로 만나는 카페 혼잡도 서비스

[![Apps-in-Toss](https://img.shields.io/badge/Apps--in--Toss-SDK%202.x-3182F6?style=flat-square)](https://developers-apps-in-toss.toss.im/)
[![React Native](https://img.shields.io/badge/React%20Native-0.84-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Naver Maps](https://img.shields.io/badge/Naver%20Maps-JS%20API%20v3-03C75A?style=flat-square)](https://www.ncloud.com/product/applicationService/maps)

</div>

---

## 📌 소개

**카페붐빔**은 원하는 장소의 카페 내부 혼잡도를 확인할 수 있는 토스 미니앱입니다.

<img width="282" height="609" alt="Frame 5610" src="https://github.com/user-attachments/assets/99638ce2-3dcf-4d51-809c-848782925bc5" />
<img width="282" height="609" alt="image" src="https://github.com/user-attachments/assets/2fcd6f8b-577e-4402-affc-63502e676a0c" />
<img width="282" height="609" alt="image" src="https://github.com/user-attachments/assets/f114dfb2-70d0-41a7-8972-e4e8db669148" />


## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| 🗺️ **실시간 지도** | 주변 카페 위치를 네이버 지도 위에 표시 |
| 📊 **혼잡도 갱신** | 1분마다 http 폴링으로 카페 상태 갱신 |
| 📍 **내 위치** | Apps-in-Toss `getCurrentLocation` API로 GPS 좌표 획득 |
| 🔍 **장소 검색** | 주소·지명으로 지도 이동 |
| 🏪 **카페 상세** | 핀 탭 시 하단 시트로 사진·소개·네이버 플레이스 연결 |
| 📱 **토스 통합** | 더보기 메뉴의 공유/신고/문의 기능 자동 제공 |

## 🛠 기술 스택

### Frontend

```
React Native 0.84  +  React 19.2  +  TypeScript 5.8
Apps-in-Toss SDK 2.x  (@apps-in-toss/framework)
Granite Framework  (@granite-js/react-native)
TDS React Native  (@toss/tds-react-native)
react-native-webview  +  Naver Maps JavaScript API v3
```

## 🏗 아키텍처

```
┌────────────────────────────────────────┐
│         토스 앱 (Apps-in-Toss)          │
│  ┌──────────────────────────────────┐  │
│  │     카페붐빔 미니앱 (RN 0.84)     │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  WebView                   │  │  │
│  │  │  └─ Naver Maps JS API      │  │  │
│  │  └────────────────────────────┘  │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  API Layer (src/api)       │  │  │
│  │  └────────────┬───────────────┘  │  │
│  └───────────────┼──────────────────┘  │
└──────────────────┼─────────────────────┘
                   │ HTTPS (1분 주기 폴링)
                   ▼
        ┌──────────────────────┐
        │  Spring Boot Backend │
        │  (Kotlin)            │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │     PostgreSQL       │
        └──────────────────────┘
```


