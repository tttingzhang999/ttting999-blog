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

[Word Break](https://leetcode.com/problems/word-break/)

- 給一個字串 `s` 和一個單字字典 `wordDict`
- 判斷 `s` 能不能切成字典裡的單字，單字可以重複使用
- 限制：`n ≤ 300`、`m ≤ 1000`、`L ≤ 20`

符號定義：n = `len(s)`，m = `len(wordDict)`，L = 最長單字的長度。

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

問題出在沒有 memo。結尾的 `b` 讓每一種切法都會失敗，所以 DFS 必須把所有切法試完。同一個剩餘字串會從不同路徑重複進入，切法數量隨 n 指數成長。

> 改進：加上 visited set，把狀態從「剩餘字串」改成「起始 index」
> 每個位置只展開一次，從 exponential 降到 polynomial

關鍵觀察：重複進入同一個位置時，可以直接回傳 `False`。

只要某個位置曾經得到 `True`，整個遞迴就會一路回傳 `True` 結束，不會再回來查它。所以「看過」的位置只可能是失敗的位置。這樣只需要一個 `set`，不用 `memo = {}` 存結果。

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

這個版本可以通過，但迴圈裡每個 `w` 都會執行一次 `s[curr:]`。這是一次 O(n) 的 copy，只為了比對開頭。每個狀態要花 O(m · n)，總共 O(n² · m)。

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

拿掉 slicing 之後，每次比對只剩 O(L)，複雜度中的一個 n 換成了 L。

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

兩種寫法的差別：

- 枚舉單字：每個位置要做 m 次比對
- 枚舉長度：每個位置最多做 L 次 slice + hash，每次 O(L)

這題 `m ≤ 1000`、`L ≤ 20`，所以枚舉長度通常比較快。這個版本的複雜度跟 m 無關，字典越大優勢越明顯。

複雜度比較

所有版本加上 memo 之後，每個位置 `curr` 最多展開一次，總共 O(n) 個狀態。差別在每個狀態的成本。

| 版本                    | 每個狀態的成本 | 時間            | 空間       |
| ----------------------- | -------------- | --------------- | ---------- |
| 原始 DFS（無 memo）     | -              | O(2ⁿ)           | O(n²)      |
| visited set + slicing   | m × O(n)       | O(n² · m)       | O(n + m·L) |
| `s.startswith(w, curr)` | m × O(L)       | O(n · m · L)    | O(n + m·L) |
| 枚舉長度 + set lookup   | L × O(L)       | O(n · L² + m·L) | O(n + m·L) |

用這題的上限估算：

- O(n² · m) ≈ 9 × 10⁷
- O(n · m · L) ≈ 6 × 10⁶
- O(n · L²) ≈ 1.2 × 10⁵

slicing 版本理論上最慢，但 CPython 的 slicing 底層是 C 的 `memcpy`，常數很小，所以還是能通過。

空間的部分，三個 memo 版本相同：

- `seen` 是 O(n)
- 遞迴深度最壞 O(n)，例如字典裡有 `"a"` 時會一路切到底
- `words` set 是 O(m · L)

slicing 版本中，`s[curr:]` 產生的暫存字串在 `startswith` 回傳後就被釋放。暫存字串不會跨遞迴層累積，所以空間不會變成 O(n²)。原始 DFS 則不同：每一層都把 `curr[len(w):]` 當參數往下傳，遞迴深度 O(n) 時，堆疊上同時存著 O(n) 個字串，總共 O(n²)。