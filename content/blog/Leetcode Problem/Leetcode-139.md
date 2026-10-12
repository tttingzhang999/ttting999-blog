---
title: LeetCode 139. Word Break 解題紀錄
description: 從 TLE 的暴力 DFS 到加上 memo，再壓低 slicing 成本的思路整理
date: 2026-10-07
tags:
  - LeetCode
  - Algorithm
  - Python
  - DFS
  - Dynamic Programming
category: 技術
author: Ting Zhang
image: ""
---

## 題目連結與敘述

[Word Break](https://leetcode.com/problems/word-break/)

- 給一個字串 `s` 和一個單字字典 `wordDict`
- 判斷 `s` 能不能切成字典裡的單字，單字可以重複使用
- 限制：`n ≤ 300`、`m ≤ 1000`、`L ≤ 20`

符號定義：n = `len(s)`，m = `len(wordDict)`，L = 最長單字的長度。

## 解題過程

### 思路 1

> 原始思路：DFS 窮舉
> 從字串開頭開始，每次試字典裡的每個單字，前綴對得上就切掉，剩下的字串繼續遞迴
> 字串切完就代表成功

```Python
# TLE
# Time: O(2^n)
from collections import Counter

class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = Counter(wordDict)

        def dfs(curr):
            if curr == "":
                return True
            for w in words:
                if curr.startswith(w):
                    if dfs(curr[len(w):]):
                        return True
            return False

        return dfs(s)
```

這個版本在下面的 case 會 TLE：

```Python
s = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"
wordDict = ["a","aa","aaa","aaaa","aaaaa","aaaaaa","aaaaaaa","aaaaaaaa","aaaaaaaaa","aaaaaaaaaa"]
```

結尾的 `b` 讓每一種切法都失敗，DFS 必須把所有切法試完。沒有 memo，同一個剩餘字串會從不同路徑重複進入。

#### 時間複雜度

| 步驟     | 成本      | 原因                                          |
| -------- | --------- | --------------------------------------------- |
| 窮舉切法 | O(2ⁿ)     | 每個位置都可能切或不切，切法數量隨 n 指數成長 |
| **總計** | **O(2ⁿ)** |                                               |

#### 空間複雜度

| 項目     | 成本            | 原因                                                   |
| -------- | --------------- | ------------------------------------------------------ |
| 遞迴堆疊 | O(n²)           | 深度最壞 O(n)，每層都把剩餘字串 `curr[len(w):]` 傳下去 |
| `words`  | O(m·L)          | 存字典裡的所有單字                                     |
| **總計** | **O(n² + m·L)** | O(n²) + O(m·L)                                         |

### 思路 2

> 改進：加上 visited set，把狀態從「剩餘字串」改成「起始 index」
> 每個位置只展開一次，從 exponential 降到 polynomial

重複進入同一個位置時，可以直接回傳 `False`。

只要某個位置曾經得到 `True`，整個遞迴就會一路回傳 `True` 結束，不會再回來查它。所以「看過」的位置一定是失敗的位置，只需要一個 `set`，不用 `memo = {}` 存結果。

```Python
# Time: O(n² · m)
# Space: O(n + m·L)
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        seen = set()

        def dfs(curr):
            if curr in seen:
                return False
            seen.add(curr)
            if s[curr:] == "":
                return True
            for w in words:
                if s[curr:].startswith(w):
                    if dfs(curr + len(w)):
                        return True
            return False

        return dfs(0)
```

這個版本可以通過，但迴圈裡每個 `w` 都會執行一次 `s[curr:]`。這是一次 O(n) 的 copy，只為了比對開頭。

#### 時間複雜度

| 步驟     | 成本          | 原因                                 |
| -------- | ------------- | ------------------------------------ |
| 狀態數   | O(n)          | 每個位置 `curr` 最多展開一次         |
| 每個狀態 | O(n · m)      | 試 m 個單字，每次 `s[curr:]` 花 O(n) |
| **總計** | **O(n² · m)** | O(n) × O(n · m)                      |

#### 空間複雜度

| 項目       | 成本           | 原因                                                   |
| ---------- | -------------- | ------------------------------------------------------ |
| `seen`     | O(n)           | 每個位置最多存一次                                     |
| 遞迴堆疊   | O(n)           | 深度最壞 O(n)，例如字典裡有 `"a"` 時會一路切到底       |
| `words`    | O(m·L)         | 存字典裡的所有單字                                     |
| `s[curr:]` | O(n)           | 暫存字串在 `startswith` 回傳後就釋放，不會跨遞迴層累積 |
| **總計**   | **O(n + m·L)** | O(n) + O(n) + O(m·L) + O(n)                            |

### 思路 3

> 改進：去掉 slicing
>
> - `str.startswith` 可以傳起始位置：`s.startswith(w, curr)`，不需要 copy
> - Base case 用 `curr == len(s)` 判斷，不用產生 slice
> - 到終點是最優先的判斷，放在 `seen` 檢查之前

```Python
# Time: O(n · m · L)
# Space: O(n + m·L)
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        seen = set()

        def dfs(curr: int) -> bool:
            if curr == len(s):
                return True
            # 曾經訪問過的位置一定失敗：若成功，整個遞迴早已回傳 True
            if curr in seen:
                return False
            seen.add(curr)
            for w in words:
                if s.startswith(w, curr) and dfs(curr + len(w)):
                    return True
            return False

        return dfs(0)
```

#### 時間複雜度

| 步驟     | 成本             | 原因                                    |
| -------- | ---------------- | --------------------------------------- |
| 狀態數   | O(n)             | 每個位置 `curr` 最多展開一次            |
| 每個狀態 | O(m · L)         | 試 m 個單字，每次比對最多 L 個字元      |
| **總計** | **O(n · m · L)** | O(n) × O(m · L)，思路 2 的一個 n 換成 L |

#### 空間複雜度

| 項目     | 成本           | 原因                 |
| -------- | -------------- | -------------------- |
| `seen`   | O(n)           | 每個位置最多存一次   |
| 遞迴堆疊 | O(n)           | 深度最壞 O(n)        |
| `words`  | O(m·L)         | 存字典裡的所有單字   |
| **總計** | **O(n + m·L)** | O(n) + O(n) + O(m·L) |

### 思路 4

> 改進：枚舉長度，而不是枚舉單字
> 從 `curr` 往後切不同長度，再查 set
> 適合字典很大、但單字都很短的情況

```Python
# Time: O(n · L² + m·L)
# Space: O(n + m·L)
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        max_len = max(map(len, words))
        seen = set()

        def dfs(curr: int) -> bool:
            if curr == len(s):
                return True
            if curr in seen:
                return False
            seen.add(curr)
            for end in range(curr + 1, min(len(s), curr + max_len) + 1):
                if s[curr:end] in words and dfs(end):
                    return True
            return False

        return dfs(0)
```

#### 時間複雜度

| 步驟         | 成本                | 原因                                             |
| ------------ | ------------------- | ------------------------------------------------ |
| 建立 `words` | O(m·L)              | 每個單字要算一次 hash                            |
| 狀態數       | O(n)                | 每個位置 `curr` 最多展開一次                     |
| 每個狀態     | O(L²)               | 最多切 L 種長度，每次 slice 加 hash 花 O(L)      |
| **總計**     | **O(n · L² + m·L)** | O(m·L) + O(n) × O(L²)，只有建 set 跟 m 有關 |

#### 空間複雜度

| 項目     | 成本           | 原因                 |
| -------- | -------------- | -------------------- |
| `seen`   | O(n)           | 每個位置最多存一次   |
| 遞迴堆疊 | O(n)           | 深度最壞 O(n)        |
| `words`  | O(m·L)         | 存字典裡的所有單字   |
| **總計** | **O(n + m·L)** | O(n) + O(n) + O(m·L) |
