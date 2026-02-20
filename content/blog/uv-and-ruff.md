---
title: 'uv and Ruff: 最佳的 Python 工具鏈'
description: '介紹 uv 和 Ruff，兩個最佳的 Python 工具鏈，以及如何遷移到 uv 和 Ruff。'
date: '2025-10-24'
tags: ['Python', 'Tooling', 'Development', 'uv', 'Ruff']
category: '技術'
author: 'Ting Zhang'
image: ''
draft: false
---

# 這篇文章的用處？

> 若遇過 format on save 很慢 / 裝環境很麻煩 / 套件衝突，那這篇文章可能對你有用

# uv

> uv 是一個極速的 Python 套件管理器和專案管理工具，被設計為 pip、pip-tools、pipx、poetry、pyenv、virtualenv 等工具的統一替代方案。
>
> uv 的核心理念是提供一個快速、可靠且易用的 Python 工具鏈。

## uv 的主要特點

- **速度極快**
- **統一的工作流程**
    - 整合了套件安裝、虛擬環境管理、專案初始化等功能
    - 一個工具解決多個需求，簡化開發工作流程
- 確保所有環境部署時依賴相同 (`uv.lock`)
- 方便切換 python 版本，以及在設定檔中鎖定 python 版本

## requirements.txt vs pyproject.toml

> **pyproject.toml 是官方標準**

- PEP 518、PEP 621 等官方標準定義的專案配置格式
- Python 生態系統的統一標準，未來發展方向
- 被所有現代工具（pip、uv、poetry、setuptools）支援
- 可以根據開發、打包、部署等環境分別配置
- 有 support 的工具都可以統一配置
    - 例如等等要介紹的 ruff

> **requirements.txt 是非正式慣例**

- 只是社群約定俗成的做法
- 沒有正式規範，格式相對簡陋
- 逐漸被新工具取代

### 範例 pyproject.toml

```toml
[project]
name = "my-awesome-project"
version = "1.0.0"
description = "A fantastic Python project"
authors = [{name = "Your Name", email = "you@example.com"}]
license = {text = "MIT"}
readme = "README.md"
keywords = ["python", "awesome"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Programming Language :: Python :: 3.11",
]

# 依賴管理
dependencies = [
    "requests>=2.28.0",
    "click>=8.0.0",
]

# 開發依賴
[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]
test = [
    "pytest-cov>=4.0.0",
    "pytest-mock>=3.10.0",
]

# 工具配置
[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "UP", "B", "SIM", "I"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"
```

### 專案檔案架構比較

**使用 requirements.txt 的專案結構**

```
my-project/
├── requirements.txt
├── requirements-dev.txt
├── requirements-test.txt
├── setup.py        # setuptools 配置
├── setup.cfg
├── pytest.ini      # pytest 配置
├── mypy.ini        # mypy 配置
├── .coveragerc     # coverage 配置
└── pyproject.toml  # 只給 ruff 用
```

**使用 pyproject.toml 的專案結構**

```
my-project/
├── pyproject.toml  # 所有配置都在這裡
├── uv.lock         # 版本鎖定檔案
└── src/
```

---

# ruff

> ruff 是一個極速的 Python linter 和 code formatter，用 Rust 編寫，可以替代 Flake8、isort、Black 等多個工具。
>
> 它的目標是提供最快速、最全面的 Python 程式碼品質檢查和格式化解決方案。

## ruff 的主要特點

- 速度極快
- **豐富的規則集**
    - 支援 800+ 個 lint 規則
    - 整合了 Flake8、isort、pycodestyle、pyflakes 等工具的規則
- **無需配置即可使用**

---

# 為什麼要使用 uv 和 ruff？

- **即時程式碼檢查**：ruff 的極速檢查讓程式碼品質控制變得無縫
    - 尤其公司專案目前很多軟體動輒幾千行（較少抽象與依功能分割檔案），使用傳統程式碼檢查與 format 工具需要接近 1 分鐘或甚至更多
        - 想像你每次 Ctrl + S 都要等 1 分鐘…
- **穩定的工具鏈**：目前 uv 與 ruff 算是在各自領域（套件管理與 lint check / format）統一江湖的存在，未來不太會遇到需要再更換的情況
- 為了未來可能需要統一產品版本鋪路，使用 Git 協作的情況會越來越多
    - **一致的環境**：uv 確保所有團隊成員使用相同的依賴版本
    - **統一的程式碼風格**：ruff 自動化程式碼風格檢查和格式化
- **更快的 CI/CD**：極速的執行效能減少構建時間，現在也有使用 GKE 的專案，可以減少 runner 開銷

---

# 遷移範例

假設原本使用 requirements.txt + 很多 lint error
- lint error 例如：
    - `if a == None`
    - assign var or import but never used
    - assign a python keyword as a var name
    - use `format` instead of f-string

有遇到任何問題找 AI 處理，或是看文檔的 best practices

## 1. 安裝與驗證

```bash
# 安裝 uv
pip install uv

# 驗證（否則要看一下文檔，根據作業系統有不同安裝方式）
uv --version
```

## 2. init 專案與安裝依賴

```bash
# 移到專案根目錄
cd {your_project}

# init 專案
uv init --no-readme

# 從現有 requirements.txt 遷移
uv add -r requirements.txt

# 手動新增依賴 (if needed)
uv add requests numpy

# 安裝 ruff
uv add --dev ruff
```

## 3. 設定 python 版本

```bash
# 查看可用的 Python 版本
uv python list

# 範例輸出：
# cpython-3.14.0b4-macos-aarch64-none                 <download available>
# cpython-3.14.0b4+freethreaded-macos-aarch64-none    <download available>
# cpython-3.13.5-macos-aarch64-none                   /opt/homebrew/bin/python3.13
# cpython-3.13.5-macos-aarch64-none                   /opt/homebrew/bin/python3
# cpython-3.13.5-macos-aarch64-none                   <download available>

# 設定專案使用的 Python 版本（例如 3.10）
uv python pin 3.10
```

## 4. 設定 `pyproject.toml`

下面只是範例，基本上只需要注意 `tool.ruff` 相關的部分

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "Add your description here"
dependencies = [
    "numpy>=1.24.0",
    "requests>=2.31.0",
]

[tool.uv]
dev-dependencies = [
    "black>=23.7.0",
    "flake8>=6.0.0",
    "pytest>=7.4.0",
    "ruff>=0.1.6",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

# 加上 ruff 相關設置
[tool.ruff]
line-length = 88
target-version = "py310"  # 改成你的 python 版本

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "C",   # flake8-comprehensions
    "B",   # flake8-bugbear
    "UP",  # pyupgrade
]
ignore = [
    "E501",  # line too long, handled by black
    "B008",  # do not perform function calls in argument defaults
    "C901",  # too complex
    "W191",  # indentation contains tabs
]
exclude = [
    "tests/*",
    "venv/*",
    "*/site-packages/*",
    "*/static/*",
    "wsgi.py",
]
fixable = ["ALL"]
unfixable = []

[tool.ruff.lint.per-file-ignores]
"tests/**/*" = ["S101"]  # 測試中允許 assert

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

## 5. 安裝依賴

```bash
# 這會產生 uv.lock，第一次加上 --frozen 就好
uv sync --frozen
```

## 6. IDE 設置（如果你使用 VS Code）

1. 安裝 VS Code extensions（如果你使用 VS Code，可以去找一下 ruff 的 extension，可以使用 IDE 的修復輔助）
2. Ctrl + Shift + P：>Format Document With… 將 ruff 設為 default formatter
3. 確保 format on save = true

## 7. 清理現有代碼

```bash
# 先看有幾個錯誤，以及可以使用 --fix 自動修復的項目
ruff check

# 自動修復
ruff check --fix

# 接下來開始清理 code style 問題
# 啟用 hot reload，可以快速修復已存在的錯誤
ruff check --watch
```

## 8. 執行專案

```bash
uv run pytest
uv run python src/main.py
```

## 9. Dockerfile 範例

```dockerfile
# 使用官方 Python 基礎映像
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 安裝 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# 複製依賴文件
COPY pyproject.toml uv.lock ./

# 安裝依賴（不包含開發依賴）
RUN uv sync --frozen --no-dev

# 複製應用程式代碼
COPY . .

# 設定 Python 路徑
ENV PATH="/app/.venv/bin:$PATH"

# 暴露端口（根據你的應用程式調整）
EXPOSE 8000

# 執行應用程式
CMD ["python", "src/main.py"]
```

---

# 參考資料

- [Astral: High-performance Python tooling](https://astral.sh/)
- [uv Documentation](https://docs.astral.sh/uv/)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
