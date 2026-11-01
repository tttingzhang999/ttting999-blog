---
title: LeetCode 678. Valid Parenthesis String 解題紀錄
description: 從只比數量的貪心解，改成追蹤開括號數範圍 [lo, hi] 的思路整理
date: 2026-10-31
tags:
  - LeetCode
  - Algorithm
  - Python
  - Greedy
category: 技術
author: Ting Zhang
image: ""
---

## 題目連結與敘述

[Valid Parenthesis String](https://leetcode.com/problems/valid-parenthesis-string/)

<iframe src="https://www.youtube-nocookie.com/embed/RolNwnqNRVs" title="LeetCode 678. Valid Parenthesis String 解題影片" width="560" height="315" loading="lazy" allowfullscreen></iframe>

- 給一個只含 `(`、`)`、`*` 的字串 `s`
- `*` 可以當成 `(`、`)` 或空字串
- 判斷 `s` 能不能變成合法的括號字串
- 範例：`"(*))"` → `true`

## 解題過程

### 思路 1

#### 流程

用 `l` 計算還沒配對的 `(`，用 `m` 計算 `*`。遇到 `)` 時先消耗 `(`，沒有 `(` 才消耗 `*`，兩者都沒有就回傳 `False`。最後用 `l - m <= 0` 判斷剩下的 `(` 能不能被 `*` 關掉。

```Python
class Solution:
    def checkValidString(self, s: str) -> bool:
        stack = []
        l = m = 0
        for c in s:
            if c == "(":
                l += 1
            elif c == "*":
                m += 1
            else:
                if l >= 1:
                    l -= 1
                    continue
                elif m >= 1:
                    m -= 1
                    continue
                else:
                    return False
        return l - m <= 0
```

#### 問題

遇到 `)` 時先用 `(`、再用 `*` 的順序是對的，問題出在最後一行。`return l - m <= 0` 只比數量，不比位置；`*` 當 `)` 時只能關閉它左邊的 `(`。另外 `stack` 沒有用到。

反例 `"*("`：`l = 1`、`m = 1`，`l - m = 0`，回傳 `True`，正解是 `False`。

改成 `return l - m == 0` 也不行。`"*("` 仍然回傳 `True`；`"*"` 則變成 `l - m = -1`，回傳 `False`，但 `*` 可以當空字串，正解是 `True`。

#### 改善

保留 `l` / `m` 的修法是再跑一次反向迴圈，`(` 與 `)` 互換，兩個方向都通過才回傳 `True`，但這樣太複雜。改成在每一步記錄開括號數的可能範圍，順序就不會丟掉。

### 思路 2

#### 流程

追蹤開括號數（還沒關閉的 `(` 數量）的可能範圍 `[lo, hi]`。`lo` 是 `*` 全當 `)` 的最小值，`hi` 是 `*` 全當 `(` 的最大值。

- `hi < 0`：`*` 全當 `(` 仍然有太多 `)`，一定失敗
- `lo = max(lo, 0)`：開括號數不能是負的，負數代表非法選法，直接丟掉
- `lo == 0`：存在一種選法讓所有 `(` 都關閉

`"*("` 的過程：讀 `*`，`lo` 從 -1 拉回 0，`hi = 1`；讀 `(`，`lo = 1`、`hi = 2`；結束時 `lo = 1`，回傳 `False`。

```Python
class Solution:
    def checkValidString(self, s: str) -> bool:
        lo = hi = 0
        for c in s:
            if c == "(":
                lo += 1
                hi += 1
            elif c == ")":
                lo -= 1
                hi -= 1
            else:
                lo -= 1
                hi += 1
            if hi < 0:
                return False
            lo = max(lo, 0)
        return lo == 0
```

#### 時間複雜度

| 步驟     | 成本     | 原因             |
| -------- | -------- | ---------------- |
| 掃描字串 | O(n)     | 每個字元只看一次 |
| **總計** | **O(n)** |                  |

#### 空間複雜度

| 項目       | 成本     | 原因         |
| ---------- | -------- | ------------ |
| `lo`、`hi` | O(1)     | 只用兩個數字 |
| **總計**   | **O(1)** |              |
