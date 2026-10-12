---
title: LeetCode Weekly Contest 591 紀錄
description: Weekly Contest 591 過程思路與心得
date: 2026-09-19
tags:
  - LeetCode
  - Contest
  - Algorithm
  - Python
category: 技術
author: Ting Zhang
image: ""
---

## Q1. Cyclically Shift Rows and Columns

### 題目連結與敘述

[Cyclically Shift Rows and Columns](https://leetcode.com/problems/cyclically-shift-rows-and-columns/)

- 給一個 `n × n` 的 `grid`
- 第 `i` 列往左循環移動 `rowShift[i]` 格，第 `j` 行往上循環移動 `colShift[j]` 格
- 回傳移動後的 grid

符號定義：s = 單一列或單一行的最大 shift 數。

### 思路 1

> 原始思路：照題目直接實作
> 依照 `rowShift` 和 `colShift`，一格一格在 grid 上 in-place 移動

```Python
# Space: O(n)
# Time: O(n^3)
class Solution:
    def cyclicShift(self, n: int, grid: list[list[int]], rowShift: list[int], colShift: list[int]) -> list[list[int]]:
        for i in range(n):
            # grid[i] left shift rowShift[i] times
            for _ in range(rowShift[i]):
                grid[i] = grid[i][1:] + grid[i][:1]

        # print(grid)
        for j in range(n):
            # grid[i][j] upward shift rowShift[i] times
            for _ in range(colShift[j]):
                tmp = grid[0][j]
                for i in range(n):
                    if i < n - 1:
                        grid[i][j] = grid[i + 1][j]
                    else:
                        grid[i][j] = tmp

        # print(grid)
        return grid
```

#### 時間複雜度

| 步驟     | 成本          | 原因                                      |
| -------- | ------------- | ----------------------------------------- |
| 移動列   | O(n² · s)     | n 列，每列最多移 s 次，每次 slice 花 O(n) |
| 移動行   | O(n² · s)     | n 行，每行最多移 s 次，每次搬 n 格        |
| **總計** | **O(n² · s)** | s ≤ n 時就是 O(n³)                        |

#### 空間複雜度

| 項目            | 成本     | 原因                                 |
| --------------- | -------- | ------------------------------------ |
| slice 暫存 list | O(n)     | 每次移動列都產生一個長度 n 的新 list |
| **總計**        | **O(n)** | 其他都是 in-place 修改               |

### 思路 2

> 最佳解：用空間換時間，另外建一個 result grid
> 用 mod 直接算出 result 的位置 `(i, j)` 來自 grid 的哪個位置

```Python
# Space: O(n^2)
# Time: O(n^2)
class Solution:
    def shiftGrid(self, n: int, grid: list[list[int]], rowShift: list[int], colShift: list[int]) -> list[list[int]]:
        result = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                si = (i + colShift[j]) % n
                sj = (j + rowShift[si]) % n
                result[i][j] = grid[si][sj]
        return result
```

#### 時間複雜度

| 步驟        | 成本      | 原因                       |
| ----------- | --------- | -------------------------- |
| 填 `result` | O(n²)     | 每格用 mod 算來源，花 O(1) |
| **總計**    | **O(n²)** | 跟 shift 數無關            |

#### 空間複雜度

| 項目     | 成本      | 原因            |
| -------- | --------- | --------------- |
| `result` | O(n²)     | 一個 n × n grid |
| **總計** | **O(n²)** |                 |

## Q2. Minimum Operations to Make Every Element Palindromic

### 題目連結與敘述

[Minimum Operations to Make Every Element Palindromic](https://leetcode.com/problems/minimum-operations-to-make-every-element-palindromic/)

- 目標：把 `nums` 的每個元素都變成正的回文數，例如 8、11、121、1221
- 每次操作：選一個元素 +2 或 -2
- 求最少操作次數

符號定義：n = `len(nums)`，P = 小於 10⁹ 的回文數數量，約 2 × 10⁵。

### 思路 1

> 原始思路：在想怎麼判斷一個數是不是回文數，沒想到可以直接窮舉

### 思路 2

> 最佳解：窮舉所有回文數，再用 binary search 找最近的
>
> - 先產生範圍內所有回文數，依奇偶分組。操作只能 ±2，所以奇偶不會改變
> - 用 binary search 找最接近 `num` 的同奇偶回文數
> - 距離除以 2 就是這個元素需要的操作次數

```Python
from bisect import bisect_left

MAX_VALUE = 10 ** 9
palindromes_by_parity = [[], []]

for prefix_num in range(1, 100_000):
    prefix = str(prefix_num)
    odd_length = prefix[:-1] + prefix[::-1]
    even_length = prefix + prefix[::-1]

    odd_palindrome = int(odd_length)
    even_palindrome = int(even_length)

    if odd_palindrome < MAX_VALUE:
        palindromes_by_parity[odd_palindrome & 1].append(odd_palindrome)
    if even_palindrome < MAX_VALUE:
        palindromes_by_parity[even_palindrome & 1].append(even_palindrome)

palindromes_by_parity[0].sort()
palindromes_by_parity[1].sort()


class Solution:
    def minOperations(self, nums: list[int]) -> int:
        total_ops = 0
        for num in nums:
            candidates = palindromes_by_parity[num & 1]
            idx = bisect_left(candidates, num)
            if idx >= len(candidates):
                idx = len(candidates) - 1
            closest_dist = min(
                abs(num - candidates[idx]),
                abs(num - candidates[idx - 1]),
            )
            total_ops += closest_dist // 2
        return total_ops
```

#### 時間複雜度

| 步驟         | 成本                     | 原因                                                |
| ------------ | ------------------------ | --------------------------------------------------- |
| 產生回文數   | O(P log P)               | 窮舉 10⁵ 個 prefix 再排序；在 module 載入時只做一次 |
| 每個元素查詢 | O(log P)                 | 在同奇偶的 list 上 binary search                    |
| **總計**     | **O(P log P + n log P)** | 預處理 + n 次查詢                                   |

#### 空間複雜度

| 項目                    | 成本     | 原因                 |
| ----------------------- | -------- | -------------------- |
| `palindromes_by_parity` | O(P)     | 存所有回文數         |
| **總計**                | **O(P)** | 跟 `nums` 的長度無關 |

## Q3. Count Shadow Pairs I

### 題目連結與敘述

[Count Shadow Pairs I](https://leetcode.com/problems/count-shadow-pairs-i/)

題目敘述很容易讓人繞昏。簡單說，要數有幾個 index pair `(i, j)` 符合：

1. `i < j`
2. `nums[i] < nums[j]`
3. `i` 和 `j` 之間沒有任何元素比 `nums[i]` 小

符號定義：n = `len(nums)`。

### 思路 1

> 原始思路：照題目直接雙層迴圈，O(n²) 會 TLE

```Python
# TLE
class Solution:
    def shadowPairs(self, nums: list[int]) -> int:
        n = len(nums)
        res = 0
        for i in range(n):
            for j in range(n):
                if j <= i:
                    continue
                if nums[j] < nums[i]:
                    break
                if nums[j] <= nums[i]:
                    continue
                res += 1
        return res

```

#### 時間複雜度

| 步驟     | 成本      | 原因                  |
| -------- | --------- | --------------------- |
| 雙層迴圈 | O(n²)     | 每個 `i` 都往右掃一次 |
| **總計** | **O(n²)** |                       |

#### 空間複雜度

| 項目     | 成本     | 原因         |
| -------- | -------- | ------------ |
| 變數     | O(1)     | 只用計數變數 |
| **總計** | **O(1)** |              |

### 思路 2

> 最佳解：維護一個非遞減的 monotonic stack

把 `nums` 從左到右掃一次，stack 裡放「還能當 `i` 的元素」。

- 新元素 `x` 進來時，pop 掉所有比 `x` 大的元素。`x` 擋在它們和後面的元素之間，所以它們之後都不能再配對
- pop 完之後，stack 裡所有比 `x` 小的元素，都能跟 `x` 組成合法的 pair
- 相同的值合併成 `(value, count)`，並用 `total_in_stack` 記錄總數，這樣不用每次重新加總

```Python
class Solution:
    def countShadowPairs(self, nums: list[int]) -> int:
        stack = []          # (value, count), non-decreasing
        total_in_stack = 0  # sum of all counts in the stack
        ans = 0

        for x in nums:
            # Pop elements > x — they can never pair again
            while stack and stack[-1][0] > x:
                total_in_stack -= stack.pop()[1]

            # Count elements strictly < x
            if stack and stack[-1][0] == x:
                ans += total_in_stack - stack[-1][1]
            else:
                ans += total_in_stack

            # Push x (merge if top has same value)
            if stack and stack[-1][0] == x:
                stack[-1] = (x, stack[-1][1] + 1)
            else:
                stack.append((x, 1))
            total_in_stack += 1

        return ans
```

#### 時間複雜度

| 步驟        | 成本     | 原因                          |
| ----------- | -------- | ----------------------------- |
| push 和 pop | O(n)     | 每個元素最多 push、pop 各一次 |
| **總計**    | **O(n)** |                               |

#### 空間複雜度

| 項目     | 成本     | 原因                 |
| -------- | -------- | -------------------- |
| `stack`  | O(n)     | 最壞全部元素都在裡面 |
| **總計** | **O(n)** |                      |

## Q4. Count Shadow Pairs II

### 題目連結與敘述

[Count Shadow Pairs II](https://leetcode.com/problems/count-shadow-pairs-ii/)

跟 Q3 幾乎一樣，只有第 3 個條件不同：

1. `i < j`
2. `nums[i] < nums[j]`
3. `i` 和 `j` 之間不存在 `k`，使得 `nums[i] < nums[k] < nums[j]`

Q3 擋住 pair 的是「比 `nums[i]` 小的元素」；這題擋住 pair 的是「值介於兩者之間的元素」。

符號定義：n = `len(nums)`。

### 思路 1

> 原始思路：照題目直接雙層迴圈，O(n²) 會 TLE

```Python
# TLE
class Solution:
    def shadowPairs(self, nums: list[int]) -> int:
        n = len(nums)
        res = 0
        for i in range(n):
            tmp_min = float('inf')
            for j in range(n):
                if j <= i:
                    continue
                if nums[j] <= nums[i]:
                    continue
                if nums[j] > tmp_min:
                    continue
                tmp_min = min(tmp_min, nums[j])
                res += 1
        return res
```

#### 時間複雜度

| 步驟     | 成本      | 原因                  |
| -------- | --------- | --------------------- |
| 雙層迴圈 | O(n²)     | 每個 `i` 都往右掃一次 |
| **總計** | **O(n²)** |                       |

#### 空間複雜度

| 項目     | 成本     | 原因                     |
| -------- | -------- | ------------------------ |
| 變數     | O(1)     | 只用計數變數和 `tmp_min` |
| **總計** | **O(1)** |                          |

### 思路 2

> 最佳解：改成維護遞減的 monotonic stack

新元素 `nums[j]` 進來時，pop 掉所有比它小的元素。每個被 pop 的元素 `nums[i]`，都跟 `nums[j]` 組成一個 shadow pair。相同的值一樣合併成 `(value, count)`。

```Python
class Solution:
    def countShadowPairs(self, nums: list[int]) -> int:
        stack = []  # (value, count), monotonically decreasing
        result = 0

        for x in nums:
            count = 1
            while stack and stack[-1][0] < x:
                val, cnt = stack.pop()
                result += cnt
            if stack and stack[-1][0] == x:
                val, cnt = stack.pop()
                count += cnt
            stack.append((x, count))

        return result
```

#### 時間複雜度

| 步驟        | 成本     | 原因                          |
| ----------- | -------- | ----------------------------- |
| push 和 pop | O(n)     | 每個元素最多 push、pop 各一次 |
| **總計**    | **O(n)** |                               |

#### 空間複雜度

| 項目     | 成本     | 原因                 |
| -------- | -------- | -------------------- |
| `stack`  | O(n)     | 最壞全部元素都在裡面 |
| **總計** | **O(n)** |                      |
