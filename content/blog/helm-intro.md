---
title: 'helmfile 介紹與實戰踩坑'
description: 'helmfile 介紹與實戰踩坑'
date: '2025-10-27'
tags: ['Helm', 'Helmfile', 'Kubernetes']
category: '技術'
author: 'Ting Zhang'
image: ''
draft: true
---

## helmfile 介紹


---
## 一些介紹子項目

#### 1. 程人頻道Ted 協助
#### 2. leetcode
#### 3. general knowledge
#### 4. 專案實作 - Moniit
#### 5. 履歷

---
## 實戰經驗

#### 1. local apply腳本
為了避免每次都要跑apply check pipeline，可以寫一個local apply腳本，每次修改完helmfile後，先跑local apply，確認沒問題後，再跑apply pipeline
#### 2. diff
有時候多人協作的時候，helmfile修改不一定會等於apply的結果，這時候可以看diff來確認差異
曾經因為diff沒有看到，導致apply錯誤的版本，導致檢測到錯誤的狀況，被devOps團隊提醒要小心使用

---
## 心得