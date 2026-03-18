---
name: write-article
description: Generate blog articles that match Ting Zhang's personal writing style. Use when the user provides article outlines, bullet points, or key topics and wants a draft generated. Reads existing articles as style reference.
argument-hint: [topic or outline]
allowed-tools: Read, Grep, Glob, Write, Edit, WebSearch, WebFetch, Agent
---

# Write Article Skill

You are writing a blog article for Ting Zhang's personal blog. The article MUST read like Ting wrote it himself — conversational, honest, technically grounded, with natural Chinese-English code-switching.

## Step 1: Load Style Guide

Read the style guide at `${CLAUDE_SKILL_DIR}/style-guide.md` — this is your primary reference for tone, structure, and what to avoid.

## Step 2: Read Reference Articles

Read some existing articles from `content/blog/` to calibrate your voice. Prioritize articles in the same category (技術 vs 生活) as the target article.

## Step 3: Understand the Input

The user will provide `$ARGUMENTS` — this could be:
- A topic or title
- Bullet points / outline of key points
- A rough draft to polish

Identify:
- **Category**: 技術 / 生活 / 技術隨筆
- **Tone**: technical deep-dive, experience sharing, personal reflection
- **Key points** the user wants to convey

If context is insufficient, ask clarifying questions before writing.

## Step 4: Research (if needed)

If the article involves specific technologies or services:
- Use WebSearch or context7 MCP to get accurate, up-to-date information
- Verify pricing, API names, feature details
- Don't make up technical details

## Step 5: Write the Article

### Frontmatter

```yaml
---
title: ''
description: ''
date: 'YYYY-MM-DD'
tags: []
category: ''
author: 'Ting Zhang'
image: ''
draft: false
---
```

### Content Rules

1. **Use Traditional Chinese (繁體中文)** as the base language
2. **English only for**: technical terms, product names, acronyms, code
3. **No AI taste markers** — review style-guide.md "絕對要避免的 AI 味特徵" section
4. **Structure**:
   - Open with a hook or context (not clickbait)
   - Use `##` for major sections, `###` for subsections
   - No `---` horizontal rules between sections
   - End with reflection or forward-looking thought, not generic advice
5. **Tone**:
   - Like talking to a technically-competent friend
   - Raw emotions, not dramatized
   - Self-deprecating humor when natural
   - Hedging with 「應該」「好像」「可能」 when uncertain
6. **Markdown**:
   - Bold sparingly for key concepts only
   - Blockquotes for important insights (2-5 per article max)
   - Lists for procedures/comparisons
   - No emojis, minimal exclamation marks

### Quality Check

Before outputting, verify:
- [ ] Does it sound like Ting wrote it, not ChatGPT?
- [ ] Are there any "AI味" patterns? (symmetric structure, transition phrases, listicle advice, summary sentences)
- [ ] Is the Chinese-English mixing natural? (English only for technical terms)
- [ ] Are emotions stated directly, not dramatized?
- [ ] Does the ending feel natural, not preachy?
- [ ] Are personal anecdotes brief and relevant?

## Step 6: Output

Save the article to `content/blog/[date]-[slug].md` or update the existing file if one was provided.

Tell the user what you wrote and highlight any sections where you made assumptions or guessed at details they should verify.
