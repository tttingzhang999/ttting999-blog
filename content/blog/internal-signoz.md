## 前言

## 用處

如果有分散式服務，目前可能遇到的問題：

- 有錯的時候需要各自看service log，沒有統一的 trace 可以串起來
- 效能瓶頸要靠「感覺」和「經驗」來猜
- CloudWatch 的 console 分散在好幾個頁面，排查一個問題要在 Logs Insights、X-Ray、Metrics 之間跳來跳去

目標：建一套統一的 Observability 平台，讓 Metrics / Traces / Logs 都在同一個地方查看。

## 方案

我們支援兩種 Observability Backend，依客戶的需求和預算擇一部署：


| 方案           | Collector                        | Backend             | 場景                                |
| :--------------- | :--------------------------------- | :-------------------- | :------------------------------------ |
| **SigNoz**     | SigNoz OTel Collector (EKS)      | SigNoz + ClickHouse | 需要完整 APM + Trace 分析，預算可控 |
| **CloudWatch** | AWS ADOT Collector (本地 Docker) | CloudWatch + X-Ray  | 已深度使用 AWS 生態系，不想額外維運 |

> 關鍵設計：兩種方案都使用 OTLP HTTP (:4318)，切換只需改 OTEL_EXPORTER_OTLP_ENDPOINT 一個環境變數。應用端的程式碼完全不用改，未來要換 vendor 也零成本。

## CloudWatch vs SigNoz：功能比較

> AI gen 的, 一些常見功能是對的，但是比較深入的功能 (ex: Cloudwatch AI Operations) 沒特別驗證過


| 功能領域            | AWS CloudWatch                          | SigNoz                                     |
| --------------------- | ----------------------------------------- | -------------------------------------------- |
| **Traces**          | X-Ray（單次查詢限 6 小時）              | Traces Explorer（任意時間範圍）            |
| **Metrics**         | CloudWatch Metrics                      | ClickHouse + PromQL                        |
| **Logs**            | Logs Insights（專有語法）               | Logs Explorer（ClickHouse SQL）            |
| **Service Map**     | Application Map                         | Service Map                                |
| **Dashboard**       | 超過 3 個需付費                         | 無限免費                                   |
| **Alerts**          | CloudWatch Alarms                       | 可對 Metrics/Traces/Logs 設警報            |
| **AI 根因分析**     | Investigations（生成式 AI）             | 無                                         |
| **GenAI 監控**      | Bedrock AgentCore 整合                  | 無                                         |
| **合成監控 / RUM**  | Synthetics Canaries + RUM               | 無（需外部工具）                           |
| **Container**       | Container Insights（深度 ECS/EKS 整合） | 透過 OTel Collector 收集                   |
| **Lambda / DB**     | Lambda Insights / Database Insights     | 無原生支援                                 |
| **網路監控**        | Flow / Internet / Synthetic Monitors    | 無                                         |
| **Log 異常偵測**    | ML 自動偵測                             | 無                                         |
| **例外監控**        | 無原生功能                              | Exceptions Monitoring（自動從 trace 擷取） |
| **Messaging Queue** | 無原生功能                              | Kafka / Celery 監控                        |
| **Log Pipeline**    | 無                                      | 支援解析、轉換、trace 關聯                 |

### 選型邏輯

怎麼幫客戶選？在 APM 和分散式追蹤這個場景，SigNoz 明顯更適合：

**1. 統一介面 vs 四散的 Console**

CloudWatch 排查一個問題，需要在 Logs Insights、Metrics console、X-Ray、Application Signals 之間跳轉，每個的查詢語法還不一樣。SigNoz 把 Metrics / Traces / Log 放在同一個介面，從延遲高的 trace 直接點進去看對應的 log，不需要切 console。

**2. X-Ray 的 6 小時查詢限制**

X-Ray 雖然保留 30 天的追蹤資料，但 UI 上一次只能查 6 小時的範圍。想看一整天的 trace？要手動跑 4 次查詢再拼起來。SigNoz 沒有這個限制。

**3. OpenTelemetry 原生**

SigNoz 直接基於 OpenTelemetry 打造，資料進來就能用。CloudWatch 需要透過 ADOT（AWS Distro for OpenTelemetry）做中間轉換，多了一層 mapping 就多了一層可能出問題的地方。

**4. 成本結構**

自建 SigNoz 只需要 EKS 上的計算資源，費用可控且可預測。CloudWatch 的計費項目多且分散：自訂指標、Dashboard、GetMetricData API 呼叫、Log 儲存和查詢、X-Ray trace 記錄⋯每一項都獨立計費，帳單很難預估。

> 但如果客戶已經重度使用 AWS 生態系（Lambda、ECS、RDS 等），CloudWatch 的 Lambda Insights、Container Insights、Database Insights、AI Investigations 這些整合是 SigNoz 目前無法替代的。

**選型建議：以 APM + 分散式追蹤為主要需求 → SigNoz。以 AWS 基礎設施監控為主且不想額外維運 → CloudWatch。根據客戶的實際需求和預算，選擇其中一套。**

## SigNoz 部署 - 資源配置 & 驗證

SigNoz 用官方 Helm chart 部署到 EKS 上，具體的 YAML 和指令都在 [repo](https://github.com/{repo_address}/tree/main/opentelemetry "https://github.com/{repo_address}/tree/main/opentelemetry") 裡的 `signoz/` 目錄，這邊只講幾個需要思考的設計決策。

### 驗證

這次 gc-host 上部署的 SigNoz 不使用 ip whitelist 限制存取

有兩個對外端點，目前透過以下方式驗證：

[**UI**](https://signoz.internal.xx.ai/ "https://signoz.internal.xx.ai")**（** `signoz.internal.xx.ai`）— 直接使用 SigNoz 內建的 SSO，接 Google OAuth 登入。團隊成員用公司 Google 帳號登入即可，不需要額外管理帳號密碼。

**OTLP Collector（** `signoz-otel.internal.xx.ai`）— 這是機器對機器的端點，不適合走 SSO。做了兩層防護：

1. **Bearer Token 驗證** — nginx ingress 的 `configuration-snippet` 檢查 `Authorization` header，不帶正確 token 直接回 401
   1. Token 放在 1Password 的 `Internal Signoz Collector` 內
2. **Rate Limiting** — 100 req/s per IP，burst 500，防止意外或惡意的大量灌入

Token 存在 `.env`（gitignored），部署時透過 `envsubst` 注入到 ingress yaml。服務端透過 `OTEL_EXPORTER_OTLP_HEADERS` 環境變數帶入，不需要改任何程式碼。

### 資源配置策略

因為是內部 dev 環境，整體策略是**壓到最小夠用** ：

* **ClickHouse** ：1Gi request / 3Gi limit，20Gi gp3 磁碟
* **TTL** ：Traces 和 Metrics 都只保留 3 天
* **關掉不需要的元件** ：alertmanager、zookeeper 在 dev 環境沒有用

> 所有元件都明確設了 resource requests 和 limits。不設 limits 的話，ClickHouse 非常容易吃光整個 node 的記憶體。

### ClickHouse 磁碟管理

> 之前架設 Signoz 還在測試的時候有發現記憶體資源不足導致 Service CrashLoop, 目前猜這個解法可以解決，但還要擺一陣子看看

20Gi 的 EBS 搭配 3 天 TTL，理論上不會爆。但 ClickHouse 的 TTL 清理是惰性的（不會主動跑），如果突然灌入大量 trace，磁碟可能來不及釋放。

所以加了一個 K8s CronJob，每 6 小時檢查磁碟使用率：

* **< 75%** ：正常，不做任何事
* **>= 75%** ：強制 `OPTIMIZE TABLE ... FINAL`，觸發 TTL 清理
* **>= 90%** ：緊急模式，直接 drop 最舊的 partition

## 應用如何接入

### Demo Apps

> 目前Signoz UI & collector 的憑證還在處理，好了的話就不用 skip ssl 驗證，目前先用個 workaround 的方法繞過去

[repo](https://github.com/{repo_address}/tree/main/opentelemetry "https://github.com/{repo_address}/tree/main/opentelemetry") 裡有三個 demo 應用（Express、NestJS、FastAPI），涵蓋了幾種常見場景：

* 一般 API 回應
* 慢回應模擬（500ms delay）
* DB 查詢（SQLAlchemy）
* 外部 HTTP 呼叫（httpx → [**httpbin.org**](http://httpbin.org/) ）
* Error logging

用 `make demo` 一鍵啟動，`make demo-traffic` 打流量，`make verify-signoz` 驗證端到端是否通。

### 三個設計原則

1. **盡量不寫 SDK wrapper** — 直接使用官方 OpenTelemetry SDK，跟著社群走，減少維護負擔
2. **所有配置走環境變數** — 程式碼裡零 hardcode，SDK 自動讀取 `OTEL_*` 環境變數
3. **tracing 初始化** — 在任何其他 import / app 初始化之前，否則可能會漏掉早期的 span

### 共用 backend 如何分辨service

* SigNoz 可以設定客製化的 filter 欄位，透過環境變數 `OTEL_RESOURCE_ATTRIBUTES` 來進行標注，UI上就會出現 filter

![](/images/blog/internal-signoz/image.png)

### 切換 Backend = 修改環境變數

這是整個架構最核心的設計：不管客戶選哪套 backend，應用端的程式碼完全一樣，只需要改一個環境變數：

* 選 SigNoz → `OTEL_EXPORTER_OTLP_ENDPOINT=<https://signoz-otel.internal.xx.ai`>
* 選 CloudWatch → `OTEL_EXPORTER_OTLP_ENDPOINT=<http://localhost:4318`（透過本地> ADOT Collector）

### Sampling 策略

所有服務統一使用 10% head-based sampling（`parentbased_traceidratio`）。

用 `parentbased` 而不是純 `traceidratio` 是為了確保：如果上游服務決定要 sample 這個 trace，下游服務也會保留，不會斷掉整條追蹤鏈。

## 參考資料

* [SigNoz Documentation](https://signoz.io/docs/introduction/ "https://signoz.io/docs/introduction/")
* [OpenTelemetry Documentation](https://opentelemetry.io/docs/ "https://opentelemetry.io/docs/")
* [AWS ADOT Documentation](https://aws-otel.github.io/docs/introduction "https://aws-otel.github.io/docs/introduction")
* [SigNoz Helm Chart](https://github.com/SigNoz/charts "https://github.com/SigNoz/charts")