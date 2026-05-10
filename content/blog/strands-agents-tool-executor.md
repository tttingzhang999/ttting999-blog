---
title: 'Strands Agents Tool Executor Behavior Research'
description: 'Exploring the design principles, behavioral patterns, and implementation details of the Tool Executor in the Strands Agents architecture, with a comparison of performance between different concurrency and asynchronous techniques in this context.'
date: '2026-05-10'
tags: ['LLM', 'Agents', 'Tool Executor', 'Python', 'Architecture']
category: 'AI'
author: 'Ting Zhang'
image: '/images/blog/strands-agents-tool-executor/banner.jpeg'
draft: false
---

## 前言

寫 Chatbot POC 的時候有個功能需求是提供”串並行 Call 小腦 Agent “的功能
因為使用的 Multi agent framework 是 Strands Agents，這樣就有很多方法可以實現了。

| **方法**                                                                                                                  | **Concept**                             | **Concern**                                                         |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| [Graph Multi-Agent Pattern](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/multi-agent/graph/) | 類似 LangGraph                            | 如何“幫agent決定他要用哪個Tools?”<br><br>Conditional Edge 如何實現？Performance如何？ |
| [Swarm Multi-Agent Pattern](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/multi-agent/swarm/) | 不負責任的 Graph Pattern，想怎麼連 Edge 全靠 LLM 決定 |                                                                     |
| [Agents as tools](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/multi-agent/agents-as-tools/) | 解釋如下圖                                   |                                                                     |

- Agent as tool
Strands Agents 號稱可以透過Prompts來自動處理 Tools 的呼叫。
![Agent loop](/images/blog/strands-agents-tool-executor/agent-loop.png)

對於 `Tool Execution` 有分成
- Concurrent executor (Default)
- Sequential executor
其實[官方文檔](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/executors/?h=tool+executor "https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/executors/?h=tool+executor")也沒有說得很清楚Concurrent / Sequential 到底差在哪？ex: 是否會繼承上下文？什麼情況應該用哪個的指引，所以直接上實驗結果：

## 測試 1: Concurrent Executor
![Concurrent Executor 測試結果](/images/blog/strands-agents-tool-executor/concurrent-result.png)
## 測試 2: Sequential Executor

![sequential Executor 測試結果](/images/blog/strands-agents-tool-executor/sequential-result.png)

## 結論

> 沒有經過 Agent loop Reasoning 的話，就不會重新整理上下文提供給 agent tool，是獨立事件，跟你的executor選哪個沒關係．

Lab 實作程式放在 [https://github.com/GoingCloud/Alpha-Lab/tree/main/strands-agents-lab/lab-1](https://github.com/GoingCloud/Alpha-Lab/tree/main/strands-agents-lab/lab-1)Connect your Github account
## Refs

[Strands agents](https://mscript.atlassian.net/wiki/spaces/4a1b8ae8e58a442d95aae1898bcbff8f/blog/2025/11/10/11141550)
[https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/executors/?h=tool+executor](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/executors/?h=tool+executor)