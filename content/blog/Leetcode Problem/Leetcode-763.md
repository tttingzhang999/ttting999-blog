---
title: LeetCode 763. Partition Labels 解題紀錄
description: 從 Counter 加 set 追蹤未結束字母，到只記最後位置的 Greedy 解法
date: 2026-10-31
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

[Partition Labels](https://leetcode.com/problems/partition-labels/)

<iframe src="https://www.youtube-nocookie.com/embed/bhWNQFyxzpM" title="LeetCode 763. Partition Labels 解題影片" width="560" height="315" loading="lazy" allowfullscreen></iframe>

## 解題過程

### 思路 1

> 原始思路：Counter 記剩餘次數，set 記還沒結束的字母
> 走到一個字母就把它放進 set，剩餘次數減 1；次數歸零就從 set 移除
> set 變空時，這段的字母都已經結束，就在這裡切開

```Python
# Time: O(n)
# Space: O(1)
from collections import Counter


class Solution:
    def partitionLabels(self, s: str) -> list[int]:
        remaining = Counter(s)
        open_letters = set()
        res = []
        size = 0
        for i, c in enumerate(s):
            open_letters.add(c)
            remaining[c] -= 1
            size += 1
            if remaining[c] == 0:
                open_letters.remove(c)
            if not open_letters:
                res.append(size)
                size = 0
        return res
```

這個解法是對的，複雜度也已經是最佳。
問題在狀態太多：`remaining`、`open_letters`、`size` 三份狀態要一起維護。
每走一步都要更新次數、加入 set、檢查歸零、再檢查 set 是否為空。

#### 時間複雜度

| 步驟           | 成本     | 原因                      |
| -------------- | -------- | ------------------------- |
| 建 `remaining` | O(n)     | 走一次字串計數            |
| 主迴圈         | O(n)     | 每個字母做常數次 set 操作 |
| **總計**       | **O(n)** | O(n) + O(n)               |

#### 空間複雜度

| 項目           | 成本     | 原因             |
| -------------- | -------- | ---------------- |
| `remaining`    | O(1)     | 最多 26 個字母   |
| `open_letters` | O(1)     | 最多 26 個字母   |
| **總計**       | **O(1)** | 不計回傳的 `res` |

### 思路 2

> 改進：只記每個字母最後出現的位置
> 用一個 `end` 取代 `Counter` 和 `set`
> 每步只取一次 `max`，走到 `end` 就切

```Python
# Time: O(n)
# Space: O(1)
class Solution:
    def partitionLabels(self, s: str) -> list[int]:
        last = {}
        for i, c in enumerate(s):
            last[c] = i
        res = []
        start = 0
        end = 0
        for i, c in enumerate(s):
            end = max(end, last[c])
            if i == end:
                res.append(end - start + 1)
                start = i + 1
        return res
```

不變量：`end` 是目前這段所有字母的 `last` 最大值。`i` 走到 `end`，代表這段沒有字母會在後面再出現。所以在這裡切一定合法，而且是最早能切的位置。

與原解差異：原解用 `Counter` 記剩餘次數，再用 set 記還沒結束的字母，set 變空就切。這個版本只記每個字母的最後位置，一個 `end` 就取代了兩份狀態。

#### 時間複雜度

| 步驟      | 成本     | 原因             |
| --------- | -------- | ---------------- |
| 建 `last` | O(n)     | 走一次字串       |
| 主迴圈    | O(n)     | 每個字母一次 max |
| **總計**  | **O(n)** | 字串走兩次       |

#### 空間複雜度

| 項目     | 成本     | 原因             |
| -------- | -------- | ---------------- |
| `last`   | O(1)     | 最多 26 個字母   |
| **總計** | **O(1)** | 不計回傳的 `res` |
