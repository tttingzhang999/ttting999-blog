---
title: "Python 並發處理方法"
description: "介紹 Python 並發處理方法，包括多線程、多進程、asyncio 以及其實務應用。"
date: "2025-10-24"
tags: [ "Python", "Concurrency", "Threading", "Asyncio" ]
category: "技術"
author: "Ting Zhang"
image: ""
---

## 這篇文章的用處？

若專案內有遇到效能瓶頸，這可能可以幫助你加速。

Python 提供了幾種並發方式，每種方式適用於不同類型的任務。

## 各方式介紹

### 1. 多線程（Multithreading）

- **特點**：由於 GIL 的存在，多線程無法實現真正的並行，線程間由解釋器切換執行。
- **適用場景**：適合 **I/O 綁定任務**，如：
  - API 呼叫
  - 檔案讀寫
  - 使用者輸入等待
- **限制**：在 CPU 綁定任務（如計算 Fibonacci 數列）中，效能與單線程迴圈相差無幾。
- **優點**：線程間資料共享簡單，記憶體開銷低。
- **缺點**：受 GIL 限制，無法利用多核心。

### 2. 多進程（Multiprocessing）

- **特點**：每個進程擁有獨立的 Python 解釋器和 GIL，因此可以在不同 CPU 核心上實現真正的並行。
- **適用場景**：適合 **CPU 綁定任務**，如：
  - 數學運算
  - 圖像處理
  - 日誌分析
- **優點**：繞過 GIL，實現真並行，速度較快。
- **缺點**：記憶體使用量高，進程間資料共享較複雜（需使用管道或共享記憶體）。

### 3. Asyncio

- **特點**：使用協程（coroutines）實現非阻塞的並發，適合 I/O 綁定任務。
- **適用場景**：
  - 網路請求
  - 檔案 I/O
  - 其他等待外部資源的任務
- **優點**：輕量，記憶體使用效率高。
- **缺點**：不適合 CPU 密集型任務，因為它並非真正的並行。

### 4. 第三方庫

- **例子**：Cython、NumPy、Pandas、PyTorch 等。
- **特點**：這些庫通常使用 C 語言實現，部分操作可繞過 GIL，提供高效能。
- **適用場景**：特定計算密集型任務（如矩陣運算）。

## 特性比較表

| 特性             | Multi-threading | Multi-processing | AsyncIO        | Disabled GIL     |
| ---------------- | --------------- | ---------------- | -------------- | ---------------- |
| **並行**         | ❌              | ✅               | ❌             | ✅               |
| **記憶體共享**   | 容易            | 困難             | 容易           | 容易             |
| **記憶體使用**   | 低              | 高               | 低             | 中等             |
| **CPU 密集型**   | 差              | 好               | 差             | 好               |
| **I/O 密集型**   | 好              | 中等             | 最佳           | 好               |
| **實作複雜度**   | 中等            | 高               | 中等           | 高               |
| **競爭條件風險** | 低（GIL保護）   | 低（隔離）       | 無（單執行緒） | 高（需手動處理） |

## 範例程式碼

```python
import time
import threading
import multiprocessing
import asyncio
import sys
from concurrent.futures import ThreadPoolExecutor
from functools import wraps

# 計時裝飾器，用於測量執行時間
def timing_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 執行時間: {end - start:.4f} 秒")
        return result
    return wrapper

# CPU 密集型任務：計算 Fibonacci 數列
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# I/O 綁定任務：模擬網路請求（全局函數）
def sync_io_task():
    time.sleep(1)  # 模擬 1 秒的 I/O 延遲

# 異步 I/O 任務
async def io_bound_task():
    await asyncio.sleep(1)  # 模擬 1 秒的 I/O 延遲
    return "I/O 任務完成"

# 多線程實現
@timing_decorator
def run_multithreading(n_tasks, task_type="cpu"):
    threads = []
    if task_type == "cpu":
        for _ in range(n_tasks):
            t = threading.Thread(target=fib, args=(35,))
            threads.append(t)
            t.start()
        for t in threads:
            t.join()
    else:  # I/O 任務
        for _ in range(n_tasks):
            t = threading.Thread(target=sync_io_task)
            threads.append(t)
            t.start()
        for t in threads:
            t.join()

# 多進程實現
@timing_decorator
def run_multiprocessing(n_tasks, task_type="cpu"):
    processes = []
    if task_type == "cpu":
        for _ in range(n_tasks):
            p = multiprocessing.Process(target=fib, args=(35,))
            processes.append(p)
            p.start()
        for p in processes:
            p.join()
    else:  # I/O 任務
        for _ in range(n_tasks):
            p = multiprocessing.Process(target=sync_io_task)
            processes.append(p)
            p.start()
        for p in processes:
            p.join()

# Asyncio 實現
@timing_decorator
async def run_asyncio(n_tasks):
    tasks = [io_bound_task() for _ in range(n_tasks)]
    await asyncio.gather(*tasks)

# 禁用 GIL 的多線程實現（需 Python 3.13 --disable-gil）
@timing_decorator
def run_nogil_multithreading(n_tasks, task_type="cpu"):
    with ThreadPoolExecutor(max_workers=n_tasks) as executor:
        if task_type == "cpu":
            futures = [executor.submit(fib, 35) for _ in range(n_tasks)]
        else:  # I/O 任務
            futures = [executor.submit(sync_io_task) for _ in range(n_tasks)]
        for future in futures:
            future.result()

# 主程式
if __name__ == "__main__":
    n_tasks = 4  # 任務數量

    print("=== CPU 密集型任務 (計算 Fibonacci 數列) ===")
    print("多線程 (Multithreading):")
    run_multithreading(n_tasks, task_type="cpu")

    print("\n多進程 (Multiprocessing):")
    run_multiprocessing(n_tasks, task_type="cpu")

    if sys.version_info >= (3, 13) and hasattr(sys, "disable_gil"):
        print("\n禁用 GIL 的多線程:")
        run_nogil_multithreading(n_tasks, task_type="cpu")
    else:
        print("\n禁用 GIL 的多線程: 需要 Python 3.13 並啟用 --disable-gil")

    print("\n=== I/O 綁定任務 (模擬網路請求) ===")
    print("多線程 (Multithreading):")
    run_multithreading(n_tasks, task_type="io")

    print("\n多進程 (Multiprocessing):")
    run_multiprocessing(n_tasks, task_type="io")

    print("\nAsyncio:")
    asyncio.run(run_asyncio(n_tasks))

    if sys.version_info >= (3, 13) and hasattr(sys, "disable_gil"):
        print("\n禁用 GIL 的多線程:")
        run_nogil_multithreading(n_tasks, task_type="io")
    else:
        print("\n禁用 GIL 的多線程: 需要 Python 3.13 並啟用 --disable-gil")
```

## 執行結果分析

```bash
$ uv run --no-project --python 3.13.5+freethreaded test.py

=== CPU 密集型任務 (計算 Fibonacci 數列) ===
多線程 (Multithreading):
run_multithreading 執行時間: 0.8912 秒

多進程 (Multiprocessing):
run_multiprocessing 執行時間: 1.0846 秒

禁用 GIL 的多線程:
GIL 狀態: 禁用
run_nogil_multithreading 執行時間: 0.8713 秒

=== I/O 綁定任務 (模擬網路請求) ===
多線程 (Multithreading):
run_multithreading 執行時間: 1.0072 秒

多進程 (Multiprocessing):
run_multiprocessing 執行時間: 1.1046 秒

Asyncio:
run_asyncio 執行時間: 0.0000 秒

禁用 GIL 的多線程:
GIL 狀態: 禁用
run_nogil_multithreading 執行時間: 1.0093 秒
```

### CPU 密集型任務（計算 Fibonacci 數列）

執行時間排序：**GIL Disabled (0.8713 秒) < 多線程 (0.8912 秒) < 多進程 (1.0846 秒)**

- **多線程**：受 GIL 限制，執行速度與單 CPU 執行差不多
- **多進程**：運用多個 CPU 核心加速
- **GIL Disabled**：運用多個 CPU 核心加速，且避免了多進程管理的額外開銷

### I/O 綁定任務（模擬網路請求）

執行時間排序：**Asyncio (0.0000 秒) << 多線程 (1.0072 秒) ≈ GIL Disabled (1.0093 秒) ≈ 多進程 (1.1046 秒)**

- **多線程、多進程、GIL Disabled**：三者效能差不多
- **Asyncio**：效能最好，因為測試任務使用 `await asyncio.sleep`，基本上不會有運行時間開銷

## 實際應用場景

**首先需要考慮業務場景，做這個優化加速是否有需要？如果加速沒有很重要的話就是一個 Nice to have 的優化。**

### 不建議使用 Disabled GIL

目前 Disabled GIL 還在測試階段，許多套件都還沒完全支援，也需要自己處理變數管理等問題，目前不考慮使用。

### 適合使用 Multiprocessing 的場景

非 AI 的大量運算需求，可以使用 Multiprocessing 來加速：

- **售電平台的最佳參數求取**：目前策略使用網格搜索，可以切分網格分配給 CPU 執行
- **EV 管理平台**：需要定時計算電站使用率

### 適合使用 Asyncio 的場景

網路的大量需求，可以使用 Asyncio 來加速：

- **MQTT / OCPP**：這類 pub/sub 協議
- **爬蟲或大量 Third-party API 請求**：
  - 使用 `aiohttp` 替換 `requests` 模組
- **Database 異步操作**：
  - pymongo 遷移到 async client (≥ v4.13)
- **Web Framework**：
  - Flask 遷移到 FastAPI

## 參考資料

- [【python】asyncio的理解與入門，搞不明白協程？看這個視頻就夠了](https://www.youtube.com/watch?v=brYsDi-JajI)
- [【python】await機制詳解。再來個硬核內容，把並行和依賴背後的原理全給你講明白](https://www.youtube.com/watch?v=K0BjgYZbgfE&t=94s)
- [Async Tutorial - PyMongo 4.14.1 documentation](https://pymongo.readthedocs.io/en/stable/async-tutorial.html)
