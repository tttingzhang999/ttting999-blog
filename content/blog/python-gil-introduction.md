---
title: Python GIL 介紹
description: Python 全域直譯器鎖（GIL）介紹
date: '2025-10-24'
tags:
  - Python
  - GIL
  - Threading
  - Concurrency
category: 技術
author: Ting Zhang
image: ''
draft: false
---

## 什麼是 GIL？

> 💡 GIL 是 CPython 解釋器中的一個鎖，確保在任何時刻只有一個線程可以執行 Python 字節碼。

這意味著即使有多個線程，Python 程式也無法真正利用多核心 CPU 實現並行（parallelism），僅能實現並發（concurrency）的假象。GIL 為 Python 提供了以下好處：

- **簡化種族條件（Race Conditions）**：防止Multi thread同時修改共享資料，降低記憶體損壞風險。
- **簡化垃圾回收（Garbage Collection）**：GIL 使記憶體管理更簡單，無需複雜的鎖機制。
- **歷史背景**：Python 於 1991 年設計時，多數電腦僅有單核心 CPU，GIL 是當時簡化實現的合理選擇。

然而，GIL 的缺點顯而易見：它限制了多核心 CPU 的利用率，使 Python 在 CPU 密集型任務（如數學計算、資料解析、AI 模型訓練）上的效能不如預期。

## 為什麼移除 GIL？（PEP 703, Python 3.13）

> 💡 隨著硬體技術的進步（多核心 CPU 普及）和 Python 社群對高效能的需求，GIL 逐漸成為瓶頸。PEP 703（Python 3.13）提出使 GIL 可選，允許程式在編譯時或運行時禁用 GIL，讓Multi thread直接利用操作系統的線程調度器，實現真正的並行。

### 移除 GIL 的動機

- **社群需求**：開發者希望 Python 能更快，並充分利用現代多核心硬體。
- **效能提升**：禁用 GIL 後，某些 CPU 密集型任務（如桶排序、分形生成）可顯著加速。
- **競爭壓力**：其他語言（如 Go、Rust）支援真正的並行，Python 需跟上時代。

### 移除 GIL 的挑戰

移除 GIL 並非易事，因為 Python 的許多核心機制依賴 GIL 的保護。以下是主要挑戰：

1. **引用計數（Reference Counting）**
   - **問題**：傳統的非原子引用計數（non-atomic reference counting）不具線程安全，可能導致種族條件。例如，refcount++ 分三步（讀、加、寫），可能被其他線程中斷。
   - **解決方案**：
     - **原子引用計數**：線程安全，但速度慢 10x-100x。
     - **偏向引用計數（Biased Reference Counting）**：檢查引用是否僅屬於單一線程，若是則使用快速的非原子計數，否則使用原子計數。

2. **垃圾回收（Garbage Collection）**
   - **問題**：傳統垃圾回收依賴 GIL 保護，需改用延遲引用計數（deferred reference counting）來處理循環引用。

3. **記憶體分配**
   - **問題**：現有記憶體分配器假設 GIL 保護，不具線程安全。
   - **解決方案**：開發新的線程安全記憶體分配器，優化列表和字典的快速讀取。

4. **兼容性**
   - **問題**：許多 C-API 擴展（如 NumPy、Pandas）假設 GIL 存在，需重新編譯以支援無 GIL 環境。

## GIL 與禁用 GIL 的比較

以下表格比較了 GIL 和禁用 GIL 的特點：

| 特性 | 啟用 GIL | 禁用 GIL |
| --- | --- | --- |
| **並行性** | 非真正的並行，僅一個線程執行 | 真正的Multi thread並行，利用多核心 |
| **資料共享** | 簡單，無需額外鎖 | 需小心處理種族條件（如使用 threading.Lock） |
| **效能** | 受限於 GIL，CPU 綁定任務慢 | 視程式而定，可能顯著提升（如桶排序、分形生成） |
| **擴展相容性** | 廣泛支援 | 需檢查擴展版本（如 Cython、NumPy） |

## 禁用 GIL 的推薦場景

禁用 GIL 在以下場景中特別有用：

- **ETL 處理**：資料提取、轉換和載入需要大量計算。
- **圖像處理**：如濾波、轉換等 CPU 密集型操作。
- **日誌分析**：處理大量資料並進行模式匹配。
- **即時分析**：需要快速響應的計算任務。

## 注意事項

- **Race Condition**：禁用 GIL 後，Multi thread可能同時存取共享資料，導致記憶體損壞。建議使用 threading.Lock 或其他同步機制。
- **擴展模組相容性**：確認使用的庫（如 NumPy、Pandas、PyTorch）支援無 GIL 環境。
- **效能不確定性**：禁用 GIL 不保證所有程式都變快，需針對具體任務進行基準測試。

## 常見誤解與解答

1. **並發(Concurrency)與並行(Parallelism)的區別**：
   - 並發是多任務「看似」同時進行，實際上可能是切換執行。
   - 並行是多任務在多核心上真正同時執行。

2. **為什麼 Python 慢？**
   - GIL 限制了Multi thread的並行性，導致 CPU 綁定任務無法充分利用多核心。

3. **禁用 GIL 如何管理 CPU 使用？**
   - 透過操作系統的線程調度器，讓Multi thread在多核心上並行執行。

4. **禁用 GIL 是否總是更快？**
   - 不一定，效能提升取決於任務類型和程式設計。某些任務（如 I/O 綁定）可能無明顯改善。

5. **簡單資料共享是什麼？**
   - 指線程間直接存取記憶體的能力，而Multi process需要管道或共享記憶體，較為複雜。

## 參考資料

- [PEP 703 – Making the Global Interpreter Lock Optional in CPython](https://peps.python.org/pep-0703/)
- [PyCon TW 2025 主題演講](https://tw.pycon.org/2025/zh-hant/conference/keynotes#Donghee_Na)
- [PyCon TW 2025 - Talk 352](https://tw.pycon.org/2025/zh-hant/conference/talk/352)
- [PyCon TW 2025 - Talk 335](https://tw.pycon.org/2025/zh-hant/conference/talk/335)