---
title: LeetCode 134. Gas Station 解題紀錄
description: 從「油最多的站出發」的錯誤直覺，到用前綴和最低點決定起點的 Greedy 解法
date: 2026-10-24
tags:
  - LeetCode
  - Algorithm
  - Python
  - Greedy
  - Prefix Sum
category: 技術
author: Ting Zhang
image: ""
---

## 題目連結與敘述

[Gas Station](https://leetcode.com/problems/gas-station/)

<iframe src="https://www.youtube-nocookie.com/embed/KqAtGu0JB0A" title="LeetCode 134. Gas Station 解題影片" width="560" height="315" loading="lazy" allowfullscreen></iframe>

- 環狀路線上有 n 個加油站
- 到第 i 站可以加 `gas[i]` 的油，從第 i 站開到下一站要花 `cost[i]` 的油
- 油箱一開始是空的，找出能繞一圈的起點；沒有就回傳 `-1`
- 題目保證答案唯一

範例：`gas = [3, 1, 2, 0, 4, 2]`，`cost = [1, 4, 1, 2, 1, 1]`，答案是 `4`。

## 解題過程

### 思路 1

> 原始思路：淨油量總和 ≥ 0 就一定有解，從油最多的那站出發

#### 流程

先把每一站的 `gas[i] - cost[i]` 加總。總和小於 0 時回傳 `-1`。總和不小於 0 時，從 `gas` 最多的那一站出發。

#### 問題

「總和 ≥ 0 一定有解」是對的，但起點選錯了。反例：

```Python
gas  = [4, 0, 3]
cost = [1, 5, 0]
diff = [3, -5, 3]   # 總和 = 1
```

從油最多的站 0 出發，油箱是 3，開到站 1 變成 3 - 5 = -2，失敗。從站 2 出發，油箱是 3 → 6 → 1，可以走完。只看 `gas[i]` 不夠，單看一站的 `diff[i]` 也不夠，後面連續的虧損可能吃掉一站的盈餘。

#### 改善

改看 `diff` 的前綴和 `P[k]`，找它的最低點 `P[m]`，從 `m + 1` 出發。

從 `m + 1` 走到站 `j`，油箱是這一段 `diff` 的總和：

- 還沒繞回開頭（`j > m`）：油箱 = `P[j] - P[m]`。`P[m]` 是最小值，所以油箱 ≥ 0。
- 已經繞回開頭（`j ≤ m`）：油箱 = `(總和 - P[m]) + P[j]`。總和 ≥ 0，所以油箱 ≥ `P[j] - P[m]` ≥ 0。

最低點是虧最多的位置。從它的下一站出發，前面先存油，最大的虧損放到最後才付。

### 思路 2

> 一次掃過陣列，一邊累加前綴和，一邊更新起點

#### 流程

```Python
class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        n = len(gas)
        curr = 0
        res = 0
        for i in range(n):
            diff = gas[i] - cost[i]
            if curr + diff <= curr:
                res = i + 1
            curr += diff
        if curr < 0:
            return -1
        # if res >= n:
        #     res -= n
        return res
```

#### 問題

`curr + diff <= curr` 其實是 `diff <= 0`，只看這一站有沒有虧，沒有看前綴和有沒有創新低。

```Python
gas  = [0, 2, 0, 2]
cost = [3, 0, 1, 0]
diff = [-3, 2, -1, 2]
P    = [-3, -1, -2, 0]   # 最低點在 0，答案是 1
```

`i = 2` 時 `diff = -1`，程式把 `res` 改成 3。但 `P[2] = -2` 不是新低，不該改。從站 3 出發，油箱是 2 → -1，失敗。

另外 `diff = 0` 也會改起點。`gas = [1]`、`cost = [1]` 的答案是 0，這個版本回傳 1，超出範圍。註解掉的那段就是想處理這個 case。

#### 改善

- 多存一個目前最低的前綴和，只有前綴和嚴格小於它時才換起點
- 最低前綴和從 0 開始，代表還沒出發；所有前綴和都 ≥ 0 時，起點就是 0
- 不用處理起點等於 n：那代表總和是嚴格新低，總和必須 < 0，這時已經回傳 `-1`

## 最終解法

Greedy + 前綴和。每一站的淨油量是 `gas[i] - cost[i]`。`total` 是前綴和，`low` 是目前最低的前綴和。`total` 創新低時，起點 `start` 改成下一站。最後總和小於 0 就無解。

```Python
class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        total = low = start = 0
        for i in range(len(gas)):
            total += gas[i] - cost[i]
            if total < low:
                low = total
                start = i + 1
        return start if total >= 0 else -1
```

> **Important: 不變量**
> 從前綴和最低點的下一站出發，前面先存油，最大的虧損放到最後才付。總和不小於 0，所以油箱一路都不會小於 0。

演算法和思路 2 的修正版相同；`curr`、`min_prefix`、`res` 改名為 `total`、`low`、`start`，三個變數合成一行初始化。

### 時間複雜度

| 步驟     | 成本     | 原因           |
| -------- | -------- | -------------- |
| 掃過陣列 | O(n)     | 每一站只看一次 |
| **總計** | **O(n)** |                |

### 空間複雜度

| 項目                    | 成本     | 原因         |
| ----------------------- | -------- | ------------ |
| `total`、`low`、`start` | O(1)     | 只用三個變數 |
| **總計**                | **O(1)** |              |
