---
title: LeetCode 45. Jump Game II 解題紀錄
description: 從「站在哪一格」的 greedy 一路補 edge case，到改成「一層一層的範圍」的 O(n) 解法
date: 2026-10-22
tags:
  - LeetCode
  - Algorithm
  - Python
  - Greedy
  - BFS
category: 技術
author: Ting Zhang
image: ""
---

## 題目連結與敘述

[Jump Game II](https://leetcode.com/problems/jump-game-ii/)

<iframe src="https://www.youtube-nocookie.com/embed/IXRHsD80RMw" title="LeetCode 45. Jump Game II 解題影片" width="560" height="315" loading="lazy" allowfullscreen></iframe>

- 給一個整數陣列 `nums`，從第 0 格出發
- `nums[i]` 是在第 i 格最多能往前跳幾格
- 題目保證一定能到最後一格，求最少要跳幾次
- 範例：`[2, 3, 1, 1, 2, 1, 1]` → `3`（0 → 1 → 4 → 6）

## 解題過程

### 思路 1

> 原始思路：站在某一格，每次跳到「下一步能跳最遠」的格子
> 從 `curr` 能到的格子裡，挑 `i + nums[i]` 最大的那一格當下一站

```Python
class Solution:
    def jump(self, nums: list[int]) -> int:
        curr = 0
        res = 0

        # ---
        tmp = 0
        for i in range(curr + 1, curr + 1 + nums[curr]):
            if i + nums[i] >= tmp:
                tmp = i + nums[i])
                choose = i
        curr = choose
        res += 1
        # ---
        return 0
```

外面包一層 `while`，條件是還沒到終點。我也在 `for` 裡加了提早結束：鄰居能直接到終點，就回傳 `res + 2`。

```Python
class Solution:
    def jump(self, nums: list[int]) -> int:
        curr = 0
        res = 0
        if len(nums) == 1:
            return 0

        # ---
        while curr < len(nums):
            tmp = 0
            choose = 0
            for i in range(curr + 1, curr + 1 + nums[curr]):
                if i + nums[i] == len(nums) - 1:
                    return res + 2
                if i + nums[i] >= tmp:
                    tmp = i + nums[i]
                    choose = i
            curr = choose
            res += 1
            if choose == 0:
                break
        # ---
        return 0
```

這版有幾個問題：

- `[1,0]` 預期 `1`。`i = 1` 本身就是終點，程式卻回傳 `res + 2 = 2`。
- `==` 應該是 `>=`。`[1,3,1]` 在 `i = 1` 時 `1 + 3 = 4`，跳過頭也算到，但沒有提早回傳。
- `range` 會超出陣列。`[2,3,1]` 第二輪 `curr = 1` 時，`range(2, 5)` 會讀到 `nums[3]`，丟出 `IndexError`。
- 最後的 `return 0` 應該回傳 `res`。

根本原因是我只檢查「鄰居能不能到終點」，沒先檢查「`curr` 自己能不能一跳到終點」。我補了一個 `if i > len(nums) - 1: continue` 擋住越界，程式卻越寫越長。這時我開始懷疑原始思路哪裡出了問題。

### 思路 2

> 嘗試：一層一層掃
> 外層選這一層的起點，內層掃這一層的範圍，更新 `farest`

```Python
class Solution:
    def jump(self, nums: list[int]) -> int:
        farest = 0
        step = 0
        if len(nums) == 1:
            return 0
        if nums[0] >= len(nums) - 1:
            return 1
        for i in range(len(nums) - 1): # 0 1 2 3 4
            if i < farest:
                continue
            end = i + nums[i]
            step += 1
            for j in range(i + 1, end + 1): #
                farest = max(farest, j + nums[j])
                if farest >= len(nums) - 1:
                    return step + 1
```

寫完我還是覺得有處理不完的 edge case。找一個反例就看得出來：`[2,3,0,5,1,1,1,1]` 預期 `3`（`0 → 1 → 3 → 7`），這版回傳 `4`。

- 第一跳的範圍是 `[1, 2]`，算出 `farest = 4`
- 第二跳的範圍應該是 `[3, 4]`，也就是上一層結束後到 `farest`
- `if i < farest: continue` 卻跳過了 `i = 3`，直接從 `i = 4` 開始
- `nums[3] = 5` 是最好的跳板，但它從來沒被掃到

### 思路 2 修正：兩層迴圈也能寫對

把範圍明確記成 `[start, end]`，內層掃完整層，下一層就是 `[end + 1, farest]`：

```Python
class Solution:
    def jump(self, nums: list[int]) -> int:
        n = len(nums)
        start, end = 0, 0
        step = 0

        while end < n - 1:
            farest = end
            for j in range(start, end + 1):
                farest = max(farest, j + nums[j])
            start = end + 1
            end = farest
            step += 1

        return step
```

### 思路 3

> 1. 用 `i + nums[i]` 更新 `farthest`，不跳過任何格子
> 2. 走到 `end` 時，這一層掃完了，跳一次，`end = farthest`

```Python
class Solution:
    def jump(self, nums: list[int]) -> int:
        res = 0
        end = 0
        farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == end:
                res += 1
                end = farthest
        return res
```

#### 時間複雜度

| 步驟     | 成本     | 原因               |
| -------- | -------- | ------------------ |
| 掃描陣列 | O(n)     | 每一格只看一次     |
| **總計** | **O(n)** |                    |

#### 空間複雜度

| 項目     | 成本     | 原因                                 |
| -------- | -------- | ------------------------------------ |
| 變數     | O(1)     | 只用 `jumps`、`end`、`farthest` 三個 |
| **總計** | **O(1)** |                                      |
