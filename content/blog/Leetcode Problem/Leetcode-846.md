---
title: LeetCode 846. Hand of Straights 解題紀錄
description: 用 Counter 加 greedy，從最小的牌開始一次扣一批的思路整理
date: 2026-10-11
tags:
  - LeetCode
  - Algorithm
  - Python
  - Greedy
  - Hash Table
category: 技術
author: Ting Zhang
image: ""
---

## 題目連結與敘述

[Hand of Straights](https://leetcode.com/problems/hand-of-straights/)

- 給一個整數陣列 `hand`，每個元素是一張牌的點數
- 判斷能不能把所有牌分成很多組，每組剛好 `groupSize` 張，而且點數連續
- 例：`hand = [1,2,3,6,2,3,4,7,8]`、`groupSize = 3`，可以分成 `[1,2,3]`、`[2,3,4]`、`[6,7,8]`

符號定義：n = `len(hand)`，k = 不同點數的數量。

## 解題過程

### 思路 1

> 原始思路：用 sorted dict 記錄每個點數剩幾張
> 按點數由小到大，從最小的牌開始湊連續的一組，每張扣 1
> 直到所有點數都歸零；中間缺牌就回傳 `False`

為什麼要用 dict 而不是直接看排序後的陣列？因為一組裡的牌在排序後不一定相鄰：

```Python
hand = [1,2,2,3,3,4]
groupSize = 3
```

正確分組是 `[1,2,3]`、`[2,3,4]`。排序後是 `1,2,2,3,3,4`，第二張 `2` 屬於另一組。用 dict 記張數，就能跳過重複的牌。

**目前剩下的最小牌，一定是某一組的開頭。**

沒有更小的牌能接在它前面，所以它不可能在一組的中間或結尾。這讓 greedy 成立：每次都從最小的牌開始湊，不需要回頭嘗試其他分法。

並且我們可以一次計算一批，而不是一組一組處理，如果最小的牌還剩 `need` 張，就一定有 `need` 組從它開始
每一張最小的牌都需要自己的一組，所以可以把 `need` 組一起處理。後面每個點數都要至少有 `need` 張，不夠就回傳 `False`。

```Python
# Time: O(n + k log k)
# Space: O(k)
from collections import Counter

class Solution:
    def isNStraightHand(self, hand: list[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False

        count = Counter(hand)
        for start in sorted(count):
            need = count[start]
            if need == 0:
                continue
            for card in range(start, start + groupSize):
                if count[card] < need:
                    return False
                count[card] -= need
        return True
```

#### 時間複雜度

| 步驟            | 成本               | 原因                                                                                 |
| --------------- | ------------------ | ------------------------------------------------------------------------------------ |
| 建立 Counter    | O(n)               | 每張牌走過一次                                                                       |
| `sorted(count)` | O(k log k)         | 只排序 k 個不同點數，不排序整個 `hand`；k ≤ n                                        |
| 扣牌            | O(n)               | 內層 `range` 每跑一次花 `groupSize` 步，但至少用掉 `groupSize` 張牌；總共只有 n 張牌 |
| **總計**        | **O(n + k log k)** | O(n) + O(k log k) + O(n)                                                             |

#### 空間複雜度

| 項目              | 成本       | 原因                 |
| --------------- | -------- | ------------------ |
| Counter         | O(k)     | 每個不同點數存一個 key      |
| `sorted(count)` | O(k)     | 排序產生一個長度 k 的新 list |
| **總計**          | **O(k)** | O(k) + O(k)        |

