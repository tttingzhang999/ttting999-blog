---
title: LeetCode 57. Insert Interval 解題紀錄
description: 從逐段比對 newInterval 的寫法，改成讓 curr 一路吸收重疊區間的線性掃描
date: 2026-11-01
tags:
  - LeetCode
  - Algorithm
  - Python
  - Intervals
category: 技術
author: Ting Zhang
image: ""
---

## 題目連結與敘述

[Insert Interval](https://leetcode.com/problems/insert-interval/)

<iframe src="https://www.youtube-nocookie.com/embed/5Ms4zgZ_L9k" title="LeetCode 57. Insert Interval 解題影片" width="560" height="315" loading="lazy" allowfullscreen></iframe>

- 給一個依開頭排序、彼此不重疊的區間陣列 `intervals`，和一個新區間 `newInterval`
- 把新區間插進去，必要時合併重疊的區間
- 回傳仍然排序、不重疊的結果

範例：`intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]]`，`newInterval = [4,8]` → `[[1,2],[3,10],[12,16]]`

## 解題過程

### 思路 1

> 流程：用 `curr` 記住目前這一段，拿 `newInterval` 跟它比
> 有重疊就把 `newInterval` 併進 `curr`，沒重疊就把 `curr` 和目前區間放進結果

```Python
class Solution:
    def insert(
        self, intervals: list[list[int]], newInterval: list[int]
    ) -> list[list[int]]:
        res = []
        curr = []
        for interval in intervals:
            if not curr:
                curr = interval
            if (
                (newInterval[0] >= curr[0] and newInterval[0] <= curr[1])
                or (newInterval[1] >= curr[0] and newInterval[1] <= curr[1])
                or (newInterval[0] >= curr[0] and newInterval[1] <= curr[1])
            ):
                curr[0] = min(newInterval[0], curr[0])
                curr[1] = max(newInterval[1], curr[1])
            else:
                if curr:
                    res.append(curr)
                    curr = []
                res.append(interval)
        return res
```

#### 問題

1. 重疊判斷漏了 `newInterval` 完全包住 `curr` 的情況，例如 `curr = [3,5]`、`newInterval = [2,7]`。第三個條件是第一個條件的子集。
2. `curr = interval` 沒有複製，修改 `curr` 會改到輸入的 `intervals`。
3. 沒重疊時先 `res.append(curr)` 再 `res.append(interval)`，同一段會加兩次。
4. 合併後的 `curr` 在迴圈結束後沒有加入結果。
5. `newInterval` 沒有重疊時不會被插入，例如 `[[1,2]]` 加上 `[5,6]`。
6. `intervals = []` 時回傳 `[]`，應該回傳 `[newInterval]`。

根本原因是拿每一段去和 `newInterval` 比，而不是讓 `newInterval` 一路吸收重疊的區間。

#### 改善

`curr` 改成從 `newInterval` 的複本開始。每個區間只判斷三種情況：在 `curr` 左邊就直接放進結果；在右邊就先放 `curr` 再放自己，並把 `curr` 設成 `None`；其他情況都是重疊，併進 `curr`。迴圈結束後，如果 `curr` 還在，就補進結果。

### 思路 2

> 流程：保留 `curr` 結構，`curr` 從 `newInterval[:]` 開始吸收重疊區間

```Python
class Solution:
    def insert(
        self, intervals: list[list[int]], newInterval: list[int]
    ) -> list[list[int]]:
        res = []
        curr = newInterval[:]
        for interval in intervals:
            if curr is None or interval[1] < curr[0]:
                res.append(interval)
            elif interval[0] > curr[1]:
                res.append(curr)
                res.append(interval)
                curr = None
            else:
                curr[0] = min(interval[0], curr[0])
                curr[1] = max(interval[1], curr[1])
        if curr:
            res.append(curr)
        return res
```

## 最終解法

一次線性掃描。`curr` 是正在合併的新區間，每個區間只有三種情況：在 `curr` 左邊就直接放進結果；在右邊就先放 `curr` 再放自己；其他情況都是重疊，併進 `curr`。

```Python
res, curr = [], newInterval
for iv in intervals:
    if curr is None or iv[1] < curr[0]:
        res.append(iv)
    elif iv[0] > curr[1]:
        res += [curr, iv]
        curr = None
    else:
        curr = [min(curr[0], iv[0]), max(curr[1], iv[1])]
return res + [curr] if curr else res
```

> **Important: 不變量**
> 不重疊只有兩種情況：`iv[1] < curr[0]` 在左邊，`iv[0] > curr[1]` 在右邊。其他情況全部是重疊，包含整個被包住或包住 `curr`。

跟思路 2 的差異：合併時建立新的 list，不在原地改 `curr`，所以不需要先複製 `newInterval`；最後一行直接回傳補上 `curr` 的結果。

### 時間複雜度

| 步驟     | 成本     | 原因                           |
| -------- | -------- | ------------------------------ |
| 掃描     | O(n)     | 每個區間只看一次，判斷是常數時間 |
| **總計** | **O(n)** |                                |

### 空間複雜度

| 項目     | 成本     | 原因                   |
| -------- | -------- | ---------------------- |
| `res`    | O(n)     | 最多 n + 1 個區間      |
| **總計** | **O(n)** |                        |
