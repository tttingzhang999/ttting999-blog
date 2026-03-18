---
title: '關於我一天在公司 AWS 開發帳號花掉 14000 鎂的那回事'
description: 'Survey AWS AgentCore Policy完，過了幾天以後才發現帳單噴了14000...'
date: '2026-03-18'
tags: ['AWS', '雲端', '成本控管', '經驗分享', '踩雷', 'DevOps', '雲服務']
category: '技術'
author: 'Ting Zhang'
image: '/images/blog/20260304-troublemaker/banner.png'
draft: false
---

身為工程師，你可能聽過同事不小心把 Production 資料庫砍了、或是忘記關 EC2 多燒了幾百塊。但你有聽過**用雲服務一天燒掉 14,000 美金**的嗎？

沒錯，這件事發生在我身上...嗎？

## TL;DR

在公司開發帳號 survey AWS Bedrock AgentCore Policy 功能，試用了 Cedar Policy Generator。幾天後帳單突然出現一筆 **$14,000+ USD 的單日費用**。經過 CloudTrail 排查確認是 Cedar Generator 觸發的異常計費，最終 AWS 承認是 Bedrock 端的計費 bug，修復並校正了帳單。

## 事情是怎麼開始的

3/4 我因為看到 [AgentCore](https://aws.amazon.com/bedrock/agentcore/) 新 Feature - Policy 剛上線，所以需要 Survey 一下。

AgentCore Policy 讓你可以用 [Cedar](https://www.cedarpolicy.com/) 語言來定義 Agent 的授權策略，控制 Agent 能存取哪些工具和資源。Cedar 是 AWS 開源的授權語言，語法可讀性很高，設計上是要讓非工程師也能看得懂的那種。

而 AgentCore 很貼心地提供了一個 **Natural Language Policy Generator**——你用自然語言描述你要的權限規則，它就幫你生成對應的 Cedar Policy。聽起來很 User-friendly 對吧？

我就照著文件走了一遍流程：

1. 建了一個 Policy Engine
2. 試了幾次 Cedar Policy Generator（用自然語言描述轉成 Cedar）
3. 確認功能可以正常運作
4. 收工，覺得這功能還不錯

整個過程大概就一兩個小時，正常的 survey 流程。

**然後就沒有然後了——直到五天後。**

## 帳單爆炸

後來請假看完中華隊在 WBC 的比賽，打贏韓國那場實在很感動，回來上班的第一天，3/9 下午，Slack突然被狂 tag，我被我們公司的 Billing Manager & Team Lead 問為何會有一筆費用產生，我也趕緊地打開CE，一個讓我愣住的數字：

> **3/4 單日Agentcore產生了 $14,000+ USD的費用**

我先是以為自己眼花了。重新整理頁面，數字還在那裡。

完了... 哪裡搞錯了吧？

## 排查過程

### Step 1：先開 Support Ticket

不管三七二十一，先開 AWS Support Ticket 回報異常帳單。把時間範圍、帳號資訊、異常金額都附上去，讓 Support 那邊開始調查。

### Step 2：自己也同步排查

等 Support 回覆的同時，我也開始自己排查紀錄。

**確認 AgentCore Policy 的收費機制**

根據 [AgentCore 定價頁面](https://aws.amazon.com/bedrock/agentcore/pricing/)，Policy 的計費主要是：

- Cedar Policy Generator：**按 input token 數量計費**（每 1,000 tokens）
- Policy Engine 的 Authorization 請求：按請求數計費

稍微思考一下：

1. 我當天的使用量根本不可能撐到這個金額。就算我瘋狂打 Generator 也打不出 $14,000，同事跟我說 Billing 那邊顯示 Policy 使用了 109 1M Tokens (接近 1.1 億，我甚至不知道一天要怎麼用掉那麼多 Tokens...)。
2. 我的 Policy Engine 並沒有 Attach Gateway，所以也沒有真正的使用 Policy 這個 Feature。

**確認 Runtime 沒有產生額外費用**

AgentCore Runtime 是按 CPU 和記憶體的秒級消耗來計費的。我需要確保沒有遺留的 Runtime 在背景持續運作，或者跟 Gateway 掛鉤產生連鎖費用。

檢查結果：沒有任何遺留資源在跑。

**CloudTrail**

我拉出了那段時間的 CloudTrail 紀錄，逐筆檢查跟 AgentCore 相關的 API 呼叫。

最終鎖定是 `StartPolicyGeneration` 這個 API 呼叫。從紀錄上看，我確實只有呼叫了3次，請求量完全不合理對應到那個帳單金額。

**結論：應該不是我的使用量有問題，是計費那邊有問題。**

### Step 3：跟 Support 同步

我把 CloudTrail 的排查結果整理好，回覆到 Support Ticket 上。附上了：
- 明確的 API 呼叫時間和次數
- 計費金額的不合理性說明
- 我這邊已經確認沒有遺留資源

### Step 4：AWS 確認是計費 Bug

AWS Support 將 case 轉給了 Bedrock 團隊。Bedrock 團隊調查後確認：

> **Cedar Policy Generator 存在計費問題，導致實際計費金額遠超正常使用量應有的費用。**

他們修復了這個計費 bug，並且**校正了帳單**。

結案。

## 心理狀態

看到 $14,000 這個數字的時候，腦袋裡跑過各種最壞的劇本——會不會要自己賠？這是我好幾個月的薪水總和，光想就覺得可怕。

即使理性上告訴自己先查原因再說，甚至基本上確定不是我這邊的問題，但焦慮感還是壓不住。

這幾天嚴重睡眠不足，每天躺在床上腦袋還在轉「到底是哪裡出問題」。腸胃也跟著出狀況，一直拉肚子。壓力對身體的影響比我想像中來得直接。

最後當 CloudTrail 的證據越來越明確指向計費問題，Support 也確認 Bedrock 團隊發現問題並正在進行修復，我的心情才開始慢慢平復。

## 事後反思

雖然這次最後證實是 AWS 的計費 bug，但整個事件讓我學到了很多。

### 1. 工作紀錄真的很重要

當下會感到慌張的原因，很大一部分來自 Context 不足，一來我不確定 Agentcore Policy 是如何計費，為何可以用到那麼貴？二來我不知道我5天前具體做了什麼操作。

如果我當初 survey 的時候沒有留下操作紀錄，排查的時候會更加困難。CloudTrail 能幫你查到 API 呼叫，但你自己當時在做什麼、為什麼做，這些 context 只有你自己知道。

**養成習慣：每次操作不熟的雲服務時，簡單記錄一下你做了什麼。** 不需要多詳細，一個簡單的筆記或是 Slack 訊息就夠了。關鍵時刻這些紀錄可以救你一命。

### 2. 使用前搞懂計費方式

這聽起來像廢話，但真的很多人（包括我）在 survey 新服務的時候會直接跳進去玩，不會先仔細看定價頁面。

- 開始 survey 前，先看過定價頁面
- 特別注意按量計費的服務，搞清楚「量」是怎麼定義的
- 開發帳號最好設定 Budget Alert，超過閾值自動通知

### 3. 先了解公司的處理流程

事發的時候，我其實不太確定公司對這種事情的態度和處理方式。後來跟主管報告時，主管第一句話就是：

> **「不可能叫你賠的，先搞清楚狀況就好。」**

這句話讓我放下了很大的心理負擔。每間公司的文化不同，但我想大部分公司都不會因為合理操作導致的意外費用而讓員工賠償。

## 結語

回頭看這件事，蠻慶幸最後不是我的問題，也慶幸公司的主管很 Nice

這次經歷讓我建立起了面對雲端成本異常的 SOP。以前覺得帳單管理是 FinOps 團隊的事，現在覺得每個會碰到雲服務的工程師都應該有基本的成本意識。

題外話，這讓我想到我大學時期第一次買股票的時候，我買了3股台積電花了大概 2000塊吧，當時每天看著損益正負三四百塊就能很影響我的心情，影響我做事與學習的效率，直到今天可能每天的損益就是一個月的薪水，我還是照常做著自己的事情。我想有了這次經驗，肯定能讓我在未來遇到類似的事情的時候心態更穩健吧。