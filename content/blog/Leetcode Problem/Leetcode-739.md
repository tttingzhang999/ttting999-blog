---
title: LeetCode 739. Daily Temperatures 解題紀錄
description: 從每輪 sorted 的錯誤寫法到單調遞減堆疊，並說明 stack 為什麼不用排序就會保持遞減
date: 2026-10-13
tags:
  - LeetCode
  - Algorithm
  - Python
  - Monotonic Stack
category: 技術
author: Ting Zhang
image: ""
---

## 題目連結與敘述

[Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)

- 給一個整數陣列 `temperatures`，代表每天的溫度
- 回傳陣列 `answer`，`answer[i]` 是第 i 天之後要等幾天，才會遇到更暖的溫度
- 之後都沒有更暖的一天，`answer[i]` 就是 `0`

```Python
Input: temperatures = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]
```

符號定義：n = `len(temperatures)`。

## 解題過程

### 思路 1

> 原始思路：用 `tmp` 存還沒找到答案的天
> 每遇到新的一天，就把 `tmp` 裡比它冷的天拿出來填答案
> 為了讓 `tmp` 保持有序，每輪都 `sorted` 一次

```Python
# Wrong Answer
# Time: O(n² log n)
class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        result = [0] * len(temperatures)

        tmp = []

        for i1, temp1 in enumerate(temperatures):
            while tmp and temp1 > tmp[0][1]:
                i2, temp2 = tmp.pop()
                result[i2] = temp1 - temp2

            tmp.append((i1, temp1))
            tmp = sorted(tmp)

        return result
```

方向是對的，但有三個問題：

1. `result[i2] = temp1 - temp2` 存的是溫度差。題目要的是等了幾天，應該是 index 差 `i1 - i2`。
2. `while` 比較的是 `tmp[0]`，`pop()` 拿走的卻是 `tmp[-1]`。比較和 pop 對到不同的元素。
3. `tmp` 裡的 tuple 按照 index 由小到大 append，本來就有序，`sorted` 不會改變任何東西。它每輪還會建立一個新 list。

#### 時間複雜度

| 步驟     | 成本            | 原因                                 |
| -------- | --------------- | ------------------------------------ |
| 外層迴圈 | O(n)            | 每天跑一次                           |
| 每輪排序 | O(n log n)      | `tmp` 最多 n 個元素，每輪都 `sorted` |
| **總計** | **O(n² log n)** | O(n) × O(n log n)                    |

#### 空間複雜度

| 項目     | 成本     | 原因                                   |
| -------- | -------- | -------------------------------------- |
| `tmp`    | O(n)     | 最壞情況所有天都在等，例如溫度一路下降 |
| `sorted` | O(n)     | 每輪產生一個新 list                    |
| **總計** | **O(n)** | O(n) + O(n)                            |

### 思路 2

> 改進：比較改成 `tmp[-1]`，答案改成 index 差，拿掉 `sorted`
> `tmp` 變成單調遞減堆疊（monotonic decreasing stack）

```Python
# Time: O(n)
# Space: O(n)
class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        result = [0] * len(temperatures)

        tmp = []

        for i1, temp1 in enumerate(temperatures):
            while tmp and temp1 > tmp[-1][1]:
                i2, temp2 = tmp.pop()
                result[i2] = i1 - i2

            tmp.append((i1, temp1))

        return result
```

拿掉 `sorted` 之後，`tmp` 裡的溫度還是有序的：從底部到頂端非嚴格遞減。下一節說明原因。

#### 為什麼 `tmp` 會保持遞減

關鍵在 `append` 之前的那段 `while`：

```Python
while tmp and temp1 > tmp[-1][1]:
    tmp.pop()
```

它的意思是：只要頂端比 `temp1` 冷，就把頂端丟掉。迴圈停下來只有兩種情況：

1. `tmp` 空了。這時放進 `temp1`，只有一個元素，一定有序。
2. 頂端 `>= temp1`。這時把 `temp1` 放上去，下面的一定比上面的暖，或一樣暖。

接著用歸納法看整個 `tmp`：

1. 一開始 `tmp` 是空的，算是有序。
2. `pop` 只從頂端拿走元素，剩下的部分順序不變。
3. `append` 時，`temp1` 一定 `<=` 新的頂端，放上去不會破壞順序。

每一步都維持遞減，所以 `tmp` 永遠是遞減的。排序這件事，`while` 已經順手做完了。

看一個局部例子。`tmp` 的溫度是 `[75, 71, 69]`，`temp1 = 72`：

1. 頂端 `69 < 72`，pop。`tmp = [75, 71]`
2. 頂端 `71 < 72`，pop。`tmp = [75]`
3. 頂端 `75 >= 72`，停止
4. append 72。`tmp = [75, 72]`

被 pop 掉的 69 和 71 也在這一刻找到答案：72 就是它們等到的較暖天。

完整走一次 `[73,74,75,71,69,72,76,73]`（表格只列溫度）：

| i1  | temp1 | pop 掉 | tmp（底 → 頂） |
| --- | ----- | ------ | -------------- |
| 0   | 73    | —      | 73             |
| 1   | 74    | 73     | 74             |
| 2   | 75    | 74     | 75             |
| 3   | 71    | —      | 75, 71         |
| 4   | 69    | —      | 75, 71, 69     |
| 5   | 72    | 69, 71 | 75, 72         |
| 6   | 76    | 72, 75 | 76             |
| 7   | 73    | —      | 76, 73         |

每一列的 `tmp` 都是遞減的，全程沒有排序。最後留在 `tmp` 的 76 和 73 等不到更暖的一天，答案維持 `0`。

#### 時間複雜度

`while` 包在 `for` 裡面，看起來像 O(n²)。但每個 index 只會 append 一次，最多 pop 一次，所以所有 `while` 加起來最多跑 n 次。

| 步驟       | 成本     | 原因                                |
| ---------- | -------- | ----------------------------------- |
| 外層迴圈   | O(n)     | 每天跑一次                          |
| 全部 `pop` | O(n)     | 每個 index 最多 pop 一次，均攤 O(1) |
| **總計**   | **O(n)** | O(n) + O(n)                         |

#### 空間複雜度

| 項目     | 成本     | 原因                                   |
| -------- | -------- | -------------------------------------- |
| `tmp`    | O(n)     | 最壞情況溫度一路下降，所有天都留在堆疊 |
| **總計** | **O(n)** |                                        |

### 思路 3

> 改進：`tmp` 只存 index，溫度用 `temperatures[tmp[-1]]` 取
> 少建 n 個 tuple，`temp2` 本來也用不到

```Python
# Time: O(n)
# Space: O(n)
class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        result = [0] * len(temperatures)

        tmp = []

        for i1, temp1 in enumerate(temperatures):
            while tmp and temp1 > temperatures[tmp[-1]]:
                i2 = tmp.pop()
                result[i2] = i1 - i2

            tmp.append(i1)

        return result
```

複雜度和思路 2 一樣，只省下常數：不用為每一天建立 tuple。

#### 時間複雜度

| 步驟       | 成本     | 原因                                |
| ---------- | -------- | ----------------------------------- |
| 外層迴圈   | O(n)     | 每天跑一次                          |
| 全部 `pop` | O(n)     | 每個 index 最多 pop 一次，均攤 O(1) |
| **總計**   | **O(n)** | O(n) + O(n)                         |

#### 空間複雜度

| 項目     | 成本     | 原因                                    |
| -------- | -------- | --------------------------------------- |
| `tmp`    | O(n)     | 最壞情況溫度一路下降，存 n 個 int index |
| **總計** | **O(n)** |                                         |
