# 토스페이먼츠 XPay 연동 샘플

XPayClient 라이브러리로 토스페이먼츠 XPay 결제를 연동하는 샘플 코드입니다. 기능별 샘플을 그대로 실행해 보고, 상점 시스템에 맞게 수정해서 사용합니다.

> 샘플은 연동에 필요한 기본 흐름만 담고 있습니다. 운영 환경에서는 입력값 검증, 예외 처리, DB 처리를 상점 정책에 맞게 구현해야 합니다.

## 구성

```text
xpay-samples/
├── php/                       # PHP 샘플 (PHP 5.6 ~ 8.x)
│   ├── lgdacom/               # 설정 파일. 웹에서 접근할 수 없는 경로에 둡니다.
│   └── webapp/                # 샘플 페이지. webapp/lgdacom/ 에 PHP 라이브러리를 둡니다.
├── java/                      # Java(JSP) 샘플
│   ├── lgdacom/               # 설정 파일. 웹에서 접근할 수 없는 경로에 둡니다.
│   ├── lib-jdk1.7/            # JDK 1.7 용 XPayClient 빌드와 라이브러리
│   └── webapp/                # 그대로 배포할 수 있는 웹 애플리케이션
│       ├── WEB-INF/lib/       # XPayClient 4.1.0.0 (JDK 1.8 ~ 17 빌드)와 공통 라이브러리
│       └── <기능>/            # 기능별 샘플
├── dotnet/                    # ASP.NET(C#) 샘플
│   ├── lgdacom/               # 설정 파일. 웹에서 접근할 수 없는 경로에 둡니다.
│   └── webapp/                # 그대로 배포할 수 있는 웹 애플리케이션 (bin/XPayClientNet.dll)
├── asp/                       # ASP(Classic) 샘플
│   ├── install/               # COM 라이브러리 (XPayClientCom.dll)
│   ├── lgdacom/               # 설정 파일. 웹에서 접근할 수 없는 경로에 둡니다.
│   └── webapp/                # 그대로 배포할 수 있는 웹 애플리케이션
├── no-xpayclient/             # XPayClient를 쓰지 않는 샘플 (안심키인)
├── https-api/                 # HTTPS로 직접 호출하는 기능 (조회, 무이자할부, 에스크로)
└── tools/package-java.sh      # Java 샘플을 JDK 별 배포용 zip 으로 묶는 스크립트
```

## 기능별 샘플

| 기능 | 위치 (`java/webapp`, `php/webapp`, `dotnet/webapp`, `asp/webapp` 아래) | 연동 가이드 |
| --- | --- | --- |
| 통합결제창 결제 (PC) | `unified-checkout/pc` | 통합결제창 결제, XPayClient 호출 패턴 |
| 통합결제창 결제 (모바일) | `unified-checkout/mobile` | 통합결제창 결제, XPayClient 호출 패턴 |
| 가상계좌 결과수신 | `virtual-account` | 가상계좌 발급·변경, 방화벽 및 IP 정보 |
| 가상계좌 발급·변경 | `virtual-account` (`CyberAccount`) | 가상계좌 발급·변경 |
| 취소 | `cancel` | 취소·부분취소 |
| 현금영수증 | `cash-receipt` | 현금영수증 |
| 카드 비인증 결제 | `card-keyin` | 카드 비인증 결제 |
| 카드 빌링 결제 | `card-billing` | 카드 빌링 결제 |
| 결제창 빌링키 발급 | `card-billing-window` (PC, `mobile/`) | 결제창 빌링키 발급 |
| 휴대폰 빌링 결제 | `mobile-billing` | 휴대폰 빌링 |
| 분할정산 | `split-settlement` | 분할정산 |
| 계좌 유효성 확인 | `acc-cert` | 계좌 유효성 확인 |
| 거래 조회 | `search` | 거래 조회 |
| 수동정산 | `settlement` | 수동정산 |
| 안심키인 결제창 | `no-xpayclient/ansim-keyin/{java,php,dotnet,asp}` | 안심키인 결제창 |
| 에스크로 배송등록·결과수신 | `https-api/escrow/{java,php,dotnet,asp}` | 에스크로 |
| 거래·정산·현금영수증 조회, 무이자할부 조회 | `https-api/curl` | 일자별 거래조회 외 |

각 폴더의 `README.md`에 진입 페이지, 수정할 값, 참고할 연동 가이드 페이지를 정리했습니다.

## 빠르게 시작하기 (Java)

1. `java/lgdacom` 폴더를 웹에서 접근할 수 없는 경로(예: `C:/lgdacom`)에 복사합니다. 샘플은 `C:/lgdacom`을 기준으로 작성되어 있습니다.
2. `lgdacom/conf/mall.conf.example`을 `mall.conf`로 복사하고, 맨 아래에 `MID = mertkey`를 입력합니다. 테스트 MID는 앞에 `t`를 붙입니다. JDK 1.7 서버는 `mall.conf.jdk1.7.example`을 쓰고, `WEB-INF/lib`를 `lib-jdk1.7`의 jar 로 바꿉니다.
3. `java/webapp`을 Tomcat 등 서블릿 컨테이너에 배포하고, `index.html`에서 기능을 선택해 실행합니다.

자세한 내용은 [java/README.md](java/README.md)를 참고합니다. PHP 는 [php/README.md](php/README.md)를 참고합니다.

## 보안 주의사항

- `mall.conf`에는 상점아이디와 mertkey가 들어갑니다. **저장소에 커밋하지 않습니다.** `.gitignore`에 등록되어 있으며, 저장소에는 `mall.conf.example`만 있습니다.
- `lgdacom` 폴더(설정과 로그)는 웹에서 접근할 수 없는 경로에 둡니다.
- 샘플 코드에 mertkey를 직접 입력해 테스트했다면, 커밋하기 전에 반드시 지웁니다.

## 문자 인코딩

모든 파일은 **UTF-8** 입니다. UTF-8 로 연동하려면 세 곳을 함께 설정해야 하며, 샘플에는 이미 반영되어 있습니다.

| 설정 | 위치 | 값 |
| --- | --- | --- |
| `output_UTF8` | `mall.conf` | `1` (XPayClient 응답을 UTF-8 로 받음) |
| `LGD_ENCODING`, `LGD_ENCODING_RETURNURL` | 결제창 호출 파라미터 | `UTF-8` |
| `LGD_ENCODING_NOTEURL` | 결제창 호출 파라미터 (`LGD_CASNOTEURL`·`LGD_NOTEURL` 사용 시) | `UTF-8` |

하나라도 빠지면 한글이 깨집니다.

## 샘플 작성 규칙

- 연동 가이드 기준 **필수 파라미터와 샘플 실행에 필요한 고정값만 활성**되어 있고, **선택 파라미터는 모두 주석**으로 들어 있습니다. 필요한 줄의 주석만 풀어 사용합니다.
- 결과 페이지는 주요 응답값만 화면에 출력하고, 나머지 응답 파라미터는 주석으로 넣어 두었습니다.
- 외부 CSS 없이 한 파일 안에서 동작하도록 단순하게 작성했습니다.
- 결과수신 주소(`LGD_RETURNURL`, `LGD_CASNOTEURL`, `LGD_NOTEURL`)는 각 요청 페이지 맨 위 "상점 설정"에 `https://상점도메인/...` 형태로 들어 있습니다. 실제 주소로 바꿉니다.
- 입력값 검증, 화면 출력 시 이스케이프 같은 문자열 처리는 넣지 않았습니다. 가맹점 환경에 맞게 구현합니다.

## 문의

찾는 정보가 없다면 [실시간 문의](https://techchat.tosspayments.com)로 알려주시기 바랍니다.
