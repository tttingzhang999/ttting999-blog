---
title: LeetCode Weekly Contest 591 解錄
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

Q1
[Cyclically Shift Rows and Columns](https://leetcode.com/problems/cyclically-shift-rows-and-columns/)

> 原始思路：直接把題義內容刻出來
> 依照 rowShift / colShift 去對 grid 做 inplace 替換

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

> 最佳解：用空間複雜度換時間複雜度，建立 result grid
> 透過 mod 來取餘數，這樣就可以直接知道當前位置 (i,j) at result 的來源位置  (i,j) at grid

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

Q2
[Minimum Operations to Make Every Element Palindromic](https://leetcode.com/problems/minimum-operations-to-make-every-element-palindromic/)

- 目標：nums 內每個元素都變成正的回文數（如 8、11、121、1221）
- 每次操作：選一個元素，只能+2 或 -2
- 求最少操作次數

> 原始思路：思考回文數字應該要怎麼判斷，但沒有想到僅有窮舉這招

> 最佳解：
> - 先找出 constraint 內所有回文數字，依照奇偶分組 (因為操作只能 +-2, 所以奇偶不會改變)
> - 透過 Binary Search 找最近 id 對應的回文數字
> - 求該 num 所需步數

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

Q3
[Count Shadow Pairs I](https://leetcode.com/problems/count-shadow-pairs-i/)

題目敘述我覺得蠻容易把自己繞昏的，總之我們在找一個 index pair，符合以下條件
1. `i < j`
2. `nums[i] < nums[j]`（左邊比右邊小）
3. i 和 j 之間沒有任何元素比 `nums[i]` 更小

我們可以做一次 for 迴圈並維護一個 Stack，檢查 `nums[i]` 右邊是否有比 `nums[i]` 更小的值
也就是説一個 x 進來以後，我們用 for 迴圈檢查 top of stack 是否 > x, 如果是的話我們就把 top of stack pop 掉
完成以後我們可以說 stack 內 "去除 = x 的" 所有元素都是一個合法的 i, 當前的 x index 為合法的 j，這時候的 i, j 都是合法的 pair

> 原本思路：沒想到什麼特別的，依照題目內容刻了一個 time n^2 會 TLE 的解

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

> 最佳解：

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

Q4
[Count Shadow Pairs II](https://leetcode.com/problems/count-shadow-pairs-ii/)

跟上一題幾乎一樣，條件為
1. `i < j`
2. `nums[i] < nums[j]`
3. i 和 j 之間不存在 k，使得 `nums[i] < nums[k] < nums[j]`，這邊上一題是不存在 `nums[k] < nums[i] < nums[j]`

維護的 stack 改成 `比 nums[j] 小的元素會被 pop 出來`
每個被 pop 的元素 `nums[i]` 和 `nums[j]` 形成一對 shadow pair

> 原本思路：沒想到什麼特別的，依照題目內容刻了一個 time n^2 會 TLE 的解

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

> 最佳解：

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