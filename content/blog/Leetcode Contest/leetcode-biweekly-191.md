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

## Q1. Count Values With Equally Spaced Occurrences I

### 題目連結與敘述

[Count Values With Equally Spaced Occurrences I](https://leetcode.com/problems/count-values-with-equally-spaced-occurrences-i/)

符號定義：n = `len(nums)`。

### 思路 1

> 原始思路：照題目的條件直接實作
> 記錄每個值出現的 index，剛好出現 3 次且間距相等就計數

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

#### 時間複雜度

| 步驟        | 成本     | 原因                       |
| ----------- | -------- | -------------------------- |
| 建立 `seen` | O(n)     | 每個元素走過一次           |
| 檢查每個值  | O(n)     | 不同值最多 n 個，每個 O(1) |
| **總計**    | **O(n)** | O(n) + O(n)                |

#### 空間複雜度

| 項目     | 成本     | 原因                |
| -------- | -------- | ------------------- |
| `seen`   | O(n)     | 所有 index 都存一次 |
| **總計** | **O(n)** |                     |

## Q2. Count Values With Equally Spaced Occurrences II

### 題目連結與敘述

[Count Values With Equally Spaced Occurrences II](https://leetcode.com/problems/count-values-with-equally-spaced-occurrences-ii/)

Q1 的進階版：出現次數從剛好 3 次，變成至少 3 次，而且所有相鄰 index 的間距都要相等。

符號定義：n = `len(nums)`。

### 思路 1

> 原始思路：沿用 Q1 的 `seen`，改用 for 迴圈檢查每個間距

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

#### 時間複雜度

| 步驟        | 成本     | 原因                                |
| ----------- | -------- | ----------------------------------- |
| 建立 `seen` | O(n)     | 每個元素走過一次                    |
| 檢查間距    | O(n)     | 所有值的 index list 加起來只有 n 個 |
| **總計**    | **O(n)** | O(n) + O(n)                         |

#### 空間複雜度

| 項目            | 成本     | 原因                            |
| --------------- | -------- | ------------------------------- |
| `seen`          | O(n)     | 所有 index 都存一次             |
| `seen[key][2:]` | O(n)     | slice 產生暫存 list，用完就釋放 |
| **總計**        | **O(n)** | O(n) + O(n)                     |

## Q3. Minimum Days to Score Exactly N Points

### 題目連結與敘述

[Minimum Days to Score Exactly N Points](https://leetcode.com/problems/minimum-days-to-score-exactly-n-points/)

每天可以選擇累加分數或休息，求剛好湊出 `n` 分需要的最少天數。

### 思路 1

> 原始思路：先算出所有可用的選項，再用 DP array 求湊出 `n` 的最少天數
> 選項是不超過 `n` 的三角數 `i(i+1)/2`

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

#### 時間複雜度

| 步驟           | 成本       | 原因                              |
| -------------- | ---------- | --------------------------------- |
| 建立 `options` | O(√n)      | 不超過 n 的三角數只有 O(√n) 個    |
| 填 DP          | O(n√n)     | n 個狀態，每個狀態試 O(√n) 個選項 |
| **總計**       | **O(n√n)** | O(√n) + O(n√n)                    |

#### 空間複雜度

| 項目      | 成本     | 原因         |
| --------- | -------- | ------------ |
| `dp`      | O(n)     | 長度 n + 1   |
| `options` | O(√n)    | 三角數的數量 |
| **總計**  | **O(n)** | O(n) + O(√n) |

## Q4. Count Subarrays with Distant Sums

### 題目連結與敘述

[Count Subarrays with Distant Sums](https://leetcode.com/problems/count-subarrays-with-distant-sums/)

計算有多少個 subarray 的總和跟 `goal` 至少差 `k`，也就是 `|sum - goal| >= k`。

符號定義：n = `len(nums)`。

### 思路 1

> 原始思路：比賽時沒寫出來
> 知道要用 prefix sum 省下每次算 sum 的時間，但不知道怎麼實作

### 思路 2

> 最佳解：反過來數 non-distant，再用 merge sort 數 prefix sum 的 pair

直接數 distant 不好算，反過來數 non-distant 比較簡單：

- Distant 條件：`|sum - goal| >= k`
- Non-distant 條件：`goal-k < sum < goal+k`，整數範圍是 `[goal-k+1, goal+k-1]`
- 答案 = 全部 subarray 數量 − non-distant 數量

Subarray 的總和是 `prefix_sum[later] - prefix_sum[earlier]`。所以 non-distant 的數量，等於差值 ≤ `goal+k-1` 的 pair 數，減掉差值 ≤ `goal-k` 的 pair 數。這種「前面的值跟後面的值比大小」的 pair，可以在 merge sort 合併時一起數。

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

#### 時間複雜度

| 步驟               | 成本           | 原因                                           |
| ------------------ | -------------- | ---------------------------------------------- |
| 建立 `prefix_sum`  | O(n)           | 每個元素走過一次                               |
| merge sort 數 pair | O(n log n)     | 每層的 scan 和 merge 都是 O(n)，共 O(log n) 層 |
| 呼叫兩次           | O(n log n)     | `upper` 和 `lower` 各一次                      |
| **總計**           | **O(n log n)** | O(n) + 2 × O(n log n)                          |

#### 空間複雜度

| 項目                          | 成本     | 原因                     |
| ----------------------------- | -------- | ------------------------ |
| `prefix_sum`                  | O(n)     | 長度 n + 1               |
| `sorted_copy`、`merge_buffer` | O(n)     | 各一個長度 n + 1 的 list |
| 遞迴堆疊                      | O(log n) | merge sort 每次對半切    |
| **總計**                      | **O(n)** | O(n) + O(n) + O(log n)   |
