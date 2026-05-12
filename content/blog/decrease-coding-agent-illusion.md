---
title: '如何降低 Coding Agent的幻覺？'
description: '介紹透過 context7 & agent skills 來提升 Coding agent one shot 機率的方法'
date: '2026-01-26'
tags: ['Tooling', 'Development']
category: '技術'
author: 'Ting Zhang'
image: '/images/blog/decrease-coding-agent-illusion/banner.png'
draft: false
---

# 前言

在做公司 POC 的過程，因為需要用到 Strands Agent & AWS AgentCore 一些比較新的SDK，實在有太多次都遇到 AI Gen 完以後發現 Syntax Highlight 沒有提示，看一下 Source Code or Docs 發現根本沒有這個 function / attr 的狀況，嘗試了幾個提升 LLM 準確率的方法

基本上解決思路都是讓 Agent 可以有個參照對象，提升正確率

## Context7

[GitHub - upstash/context7: Context7 MCP Server -- Up-to-date code documentation for LLMs and AI code editors](https://github.com/upstash/context7)

[Context7 - Up-to-date documentation for LLMs and AI code editors](https://context7.com/)

Context7 是一個 MCP Tool, 可以自動查詢最新文檔

### 文檔來源
任何人都可以到官網去發一個 Add Library Request，這邊可以看到目前正在進行 Parsing & Crawling 的目標文檔，我嘗試把我自己的repo丟上去也可以跑，並且有辦法在 Dashboard 搜尋到

![context7 scanning repo](/images/blog/decrease-coding-agent-illusion/context7-scanning-repo.png)
![context7 repo tasks dashboard](/images/blog/decrease-coding-agent-illusion/context7-repo-tasks-dashboard.png)
![context7 search custom repo](/images/blog/decrease-coding-agent-illusion/context7-search-custom-repo.png)

### 使用
可以選擇自架 MCP Server or 使用官方服務

原本因為方便所以直接使用官方服務(安裝時需填入 API key)，一個月限制 1000 次 query，實際使用發現他好像每天都會重置 1000 次的 quota，基本上用不完。

你可以選擇加敘述在會自動放到 Context 的地方 (ex: cursor rule, claude.md, agent.md, etc.)

```
Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
```

或者加在 LLM 來回的地方

```
幫我寫一個 strands agent graph pattern example, 記得遵照文檔教學執行/必須使用 context 7...
```
![context7 mcp resolve library id](/images/blog/decrease-coding-agent-illusion/context7-mcp-resolve-library-id.png)

### How it works?

使用兩個 MCP Tools 來實現

- Search 
- Get Context 

#### Context Usage

```
MCP tools · /mcp                                                                                                                                                   
     └ mcp__context7__resolve-library-id: 499 tokens                                                                                                                    
     └ mcp__context7__query-docs: 408 tokens             
```  

可以看到 context7在 context 使用上算是非常輕量的 MCP Tool

### Context7 作為 Skill 管理工具

[Skills - Context7 MCP](https://context7.com/docs/skills)

- 搜尋功能
- 號稱有濾除有安全疑慮的 Skill (不安全的 script / prompt injection…)
- 可以自動偵測本機上有安裝的 Coding LLM 然後安裝進去 (但是看起來不支援 Kiro🥲)

![context7 cli install](/images/blog/decrease-coding-agent-illusion/context7-cli-install.png)
![context7 skills search vue](/images/blog/decrease-coding-agent-illusion/context7-skills-search-vue.png)


## Skill

[Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

> 大家應該都知道的東西，網路上很多基本介紹這邊不多贅述，我的用法是把docs repo 直接放到 Reference 內，讓 LLM 去產生 SKILL.md

- 讓 LLM 知道有這個 skill
- 不一定每個 sdk 都有 docs repo, 所以也順便有個 index 可以讓 LLM 快速的查詢文檔路徑

### 範例
[GitHub - strands-agents/docs: Documentation for the Strands Agents SDK. A model-driven approach to building AI agents in just a few lines of code.](https://github.com/strands-agents/docs) 


```
# ~/.claude/skills/strands-agents-docs/SKILL.md
---
name: strands-agents-docs
description: Access comprehensive Strands Agents documentation to help build, deploy, and operate AI agents using the Strands Agents SDK
---
# Strands Agents Documentation Skill
This skill provides access to the complete Strands Agents documentation, enabling code agents to quickly locate relevant guides, examples, and API references for building AI agents with the Strands Agents SDK.
## Instructions
When working with Strands Agents SDK, use this skill to:
1. Locate relevant documentation files based on the task or concept
2. Reference specific guides for implementation patterns
3. Find deployment and production operation best practices
4. Access model provider configurations and examples
5. Understand multi-agent patterns and tool development
Search for documentation by topic or concept, and reference the appropriate markdown file path below for detailed information.
## Documentation Index
### Quickstart Guides
- `/Users/ting/.claude/skills/strands-agents-docs/references/docs/user-guide/quickstart.md` - Complete quickstart guide showing how to create your first Strands agent with tools and model providers
- `/Users/ting/.claude/skills/strands-agents-docs/references/docs/user-guide/quickstart/overview.md` - Overview of getting started with Strands Agents
=== 下略 ===
```

### Context Usage

```
Skills · /skills
 User
 └ bedrock-agentcore-sdk: 38 tokens                                                                                                                                 
 └ strands-agents-docs: 36 tokens
```

## 其他

> 基本上都是“LLM已經拉了一坨沒辦法跑的 Code”的時候，已經參與Debug了，是不理想的狀況

- 指出 site-packages 內的原始碼路徑給 LLM, 讓他參照使用
- 複製文檔直接喂到嘴邊
- 搭配其他 AI Tools (Perplexity, Deepwiki)

