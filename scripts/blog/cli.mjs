import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { planSync, applySync } from "./sync.mjs";
import { inspectDeployment } from "./deployment.mjs";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      vault: { type: "string" },
      "allow-empty": { type: "boolean" },
      verify: { type: "boolean" },
      json: { type: "boolean" },
    },
  });
  const command = positionals[0] ?? "status";
  if (!["status", "plan", "sync"].includes(command) || positionals.length > 1)
    throw new Error(
      "Usage: blog <status|plan|sync> [--vault PATH] [--allow-empty] [--verify] [--json]",
    );
  const repo = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const vault =
    values.vault ??
    process.env.BLOG_VAULT_ROOT ??
    path.resolve(
      fs.realpathSync(
        path.join(os.homedir(), ".codex/skills/cook-blog-publish"),
      ),
      "../../..",
    );
  const plan = planSync({ repo, vault, allowEmpty: values["allow-empty"] });
  if (command === "sync") applySync(plan);
  const summary = {
    command,
    articles: plan.articles.length,
    changes: plan.changes,
    manifestChanged: plan.manifestChanged,
    withdrawn: plan.manifest.withdrawn,
  };
  if (command === "status") {
    try {
      summary.deployment = await inspectDeployment(plan, {
        verify: values.verify,
      });
    } catch (error) {
      summary.deployment = {
        state: "部署狀態未知",
        error: String(error.message),
      };
      process.exitCode = 1;
    }
    if (values.verify && !summary.deployment?.verified) process.exitCode = 1;
  }
  console.log(
    values.json
      ? JSON.stringify(summary, null, 2)
      : [
          `文章 ${summary.articles} 篇｜${command === "sync" ? "同步完成" : command === "plan" ? "同步預覽" : "完整狀態"}`,
          ...summary.changes.map((c) => `${c.action.padEnd(6)} ${c.path}`),
          ...(summary.changes.length ? [] : ["文章／圖片無變更"]),
          ...(summary.manifestChanged ? ["同步 manifest 更新"] : []),
          ...(summary.deployment
            ? [JSON.stringify(summary.deployment, null, 2)]
            : []),
          ...(command === "sync"
            ? [
                "尚未確認上線；commit/push 後執行 npm run blog:status -- --verify",
              ]
            : []),
        ].join("\n"),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
