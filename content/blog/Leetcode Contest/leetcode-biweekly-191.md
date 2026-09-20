---
title: LeetCode Biweekly Contest 191 紀錄
description: Biweekly Contest 191 過程思路與心得
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
[Count Values With Equally Spaced Occurrences I](https://leetcode.com/problems/count-values-with-equally-spaced-occurrences-i/)

> 原本思路：把題目定義的條件刻出來，沒什麼特別的

```Python
class Solution:
    def countSpecialIntegers(self, nums: list[int]) -> int:
        seen = {}
        res = 0
        for i, num in enumerate(nums):
            if num in seen:
                seen[num].append(i)
            else:
                seen[num] = [i]

        # print(seen)
        for key in seen:
            if len(seen[key]) == 3 and seen[key][2] - seen[key][1] == seen[key][1] - seen[key][0]:
                res += 1
        return res
```

Q2
[Count Values With Equally Spaced Occurrences II](https://leetcode.com/problems/count-values-with-equally-spaced-occurrences-ii/)

上一題的進階版，判定條件從 3 個變成 n 個

> 原始思路：改成透過 for 迴圈處理判定

```Python
class Solution:
    def countSpecialIntegers(self, nums: list[int]) -> int:
        seen = {}
        res = 0
        for i, num in enumerate(nums):
            if num in seen:
                seen[num].append(i)
            else:
                seen[num] = [i]

        # print(seen)
        for key in seen:
            if len(seen[key]) < 3:
                continue

            first = seen[key][0]
            second = seen[key][1]
            gap = first - second
            fail = False
            # print(seen[key][2:])
            for num in seen[key][2:]:
                # print(second, num, gap)
                if gap != second - num:
                    fail = True
                    break
                else:
                    second = num
            if fail:
                continue
            else:
                res += 1
        return res
```

Q3
[Minimum Days to Score Exactly N Points](https://leetcode.com/problems/minimum-days-to-score-exactly-n-points/)

題目定義每天可以選擇累加或是休息，來湊出 target number
> 原始思路：是先把可以用的選項算出來，然後透過 DP Array 求出達到target number 所需最少的天數

```Python
class Solution:
    def minDays(self, n: int) -> int:
        options = []
        cal = 0
        i = 0
        while cal <= n:
            i += 1
            cal = (1 + i) * i // 2
            if cal > n:
                break
            options.append(cal)

        dp = [float("inf")] * (n+1)
        dp[0] = 0

        for i in range(1, n + 1):
            for j in range(len(options)):
                if i - options[j] >= 0:
                    if i - options[j] != 0 and dp[i - options[j]] != float("inf"):
                        dp[i] = min(dp[i], dp[i - options[j]] + j + 1 + 1)
                    else:
                        dp[i] = min(dp[i], dp[i - options[j]] + j + 1)
                else:
                    break
        return dp[-1]
```

Q4
沒寫出來
[Count Subarrays with Distant Sums](https://leetcode.com/problems/count-subarrays-with-distant-sums/)

> 原始思路：一頭霧水，大概知道要用 prefix sum 去節省每次計算 sum 的時間，但完全不知道如何具體實作

> 最佳解：比想像中還複雜：

題目要求計算哪些 subarray 滿足總和超過 goal 至少 k

直接數「distant」不好算。反過來數「non-distant」比較簡單，我們可以透過以下方法來知道 non-distant 的條件

- Distant 條件： `|sum - goal| >= k`
- Non-distant 條件： `goal-k < sum < goal+k`（整數就是 `[goal-k+1, goal+k-1]`）
- 答案 = 全部子陣列數 − non-distant 數量

```Python
class Solution:
    def countSubarrays(self, nums: list[int], goal: int, k: int) -> int:
        size = len(nums)
        total_subarrays = size * (size + 1) // 2
        if k == 0:
            return total_subarrays

        prefix_sum = [0] * (size + 1)
        for idx in range(size):
            prefix_sum[idx + 1] = prefix_sum[idx] + nums[idx]

        def count_pairs_with_diff_at_most(threshold: int) -> int:
            """Count pairs (earlier, later) where prefix_sum[later] - prefix_sum[earlier] <= threshold."""
            sorted_copy = list(prefix_sum)
            merge_buffer = [0] * (size + 1)

            def merge_and_count(left_start: int, right_end: int) -> int:
                if right_end - left_start <= 1:
                    return 0
                mid = (left_start + right_end) // 2
                count = merge_and_count(left_start, mid) + merge_and_count(mid, right_end)

                scan = left_start
                for right_idx in range(mid, right_end):
                    while scan < mid and sorted_copy[scan] < sorted_copy[right_idx] - threshold:
                        scan += 1
                    count += mid - scan

                write_pos = left_start
                left_idx, right_idx = left_start, mid
                while left_idx < mid and right_idx < right_end:
                    if sorted_copy[left_idx] <= sorted_copy[right_idx]:
                        merge_buffer[write_pos] = sorted_copy[left_idx]
                        left_idx += 1
                    else:
                        merge_buffer[write_pos] = sorted_copy[right_idx]
                        right_idx += 1
                    write_pos += 1
                while left_idx < mid:
                    merge_buffer[write_pos] = sorted_copy[left_idx]
                    left_idx += 1; write_pos += 1
                while right_idx < right_end:
                    merge_buffer[write_pos] = sorted_copy[right_idx]
                    right_idx += 1; write_pos += 1
                sorted_copy[left_start:right_end] = merge_buffer[left_start:right_end]
                return count

            return merge_and_count(0, size + 1)

        upper = goal + k - 1
        lower = goal - k
        non_distant_count = (
            count_pairs_with_diff_at_most(upper)
            - count_pairs_with_diff_at_most(lower)
        )
        return total_subarrays - non_distant_count
```