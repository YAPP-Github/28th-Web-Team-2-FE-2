// .claude/agents/*.md (역할 상세 SSOT) → .codex/agents/*.toml 생성기
// 실행: pnpm gen:codex — agent를 수정한 커밋에는 이 생성기 실행 결과가 같이 들어가야 한다 (shared/agent-roles.md 동기화 규칙)
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, ".claude", "agents");
const OUT = path.join(ROOT, ".codex", "agents");

// 판단 밀도 티어 매핑 (shared/agent-roles.md)
const EFFORT = { fable: "high", opus: "high", sonnet: "medium", haiku: "low" };
const VALID_EFFORT = new Set(["low", "medium", "high", "xhigh", "max"]);
// 도구만으로 판정 불가한 예외 — diff-organizer는 Bash로 git 쓰기를 한다
const SANDBOX_OVERRIDE = { "diff-organizer": "workspace-write" };

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error("frontmatter 없음");
  const meta = {};
  let currentKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      meta[currentKey] = kv[2].replace(/^['"]|['"]$/g, "");
    } else if (/^\s+-\s+/.test(line) && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(line.replace(/^\s+-\s+/, "").trim());
    }
  }
  return { meta, body: m[2].replaceAll("\r\n", "\n").trim() };
}

function tomlString(s) {
  return `"""\n${s.replaceAll('"""', '\\"\\"\\"')}\n"""`;
}

mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC).filter((f) => f.endsWith(".md"));
const seen = [];

for (const file of files) {
  const { meta, body } = parseFrontmatter(readFileSync(path.join(SRC, file), "utf8"));
  const name = meta.name ?? file.replace(/\.md$/, "");
  // tools 는 allowlist, 생략하면 전부 상속(MCP 포함) — agent-roles.md §도구 부여 규약
  const toolsSpecified = typeof meta.tools === "string" && meta.tools.trim() !== "";
  const tools = (toolsSpecified ? meta.tools.split(",") : []).map((t) => t.trim());
  const denied = (typeof meta.disallowedTools === "string" ? meta.disallowedTools.split(",") : []).map((t) => t.trim());
  const writeDenied = denied.includes("Edit") || denied.includes("Write");
  // 생략(상속) = Edit/Write 를 가진다는 뜻이므로, disallowedTools 로 뺐는지만 본다
  const canWrite = toolsSpecified ? tools.includes("Edit") || tools.includes("Write") : !writeDenied;
  const sandbox = SANDBOX_OVERRIDE[name] ?? (canWrite ? "workspace-write" : "read-only");
  // frontmatter effort 가 있으면 그걸 쓰고, 없으면 model 티어에서 유도
  const effort = VALID_EFFORT.has(meta.effort) ? meta.effort : (EFFORT[meta.model] ?? "medium");
  const skills = Array.isArray(meta.skills) ? meta.skills : [];

  const skillNote = skills.length
    ? `\n\n## 참조 스킬 (shared/skills/<이름>/SKILL.md 를 읽어라)\n${skills.map((s) => `- shared/skills/${s}/SKILL.md`).join("\n")}`
    : "";

  const toml = `# 생성 파일 — 직접 편집 금지. SSOT는 .claude/agents/${file} (pnpm gen:codex 로 재생성)
name = "${name}"
description = ${tomlString(meta.description ?? "")}
# model = "TODO(✍️): 팀이 쓰는 codex 모델 id"
model_reasoning_effort = "${effort}"
sandbox_mode = "${sandbox}"

instructions = ${tomlString(body + skillNote)}
`;
  writeFileSync(path.join(OUT, `${name}.toml`), toml);
  console.log(`✓ ${name}.toml (effort=${effort}, sandbox=${sandbox})`);
  seen.push({ name, skills });
}
console.log(`총 ${files.length}개 생성 → .codex/agents/`);

// --- drift 검사 (shared/agent-roles.md 표 ↔ frontmatter) -----------------
// 표의 '든 스킬' 열이 실제와 어긋난 이력이 있어(13개 중 11개) 기계로 막는다.
const ROLES = path.join(ROOT, "shared", "agent-roles.md");
const roleLines = readFileSync(ROLES, "utf8").split("\n");
const warn = [];
for (const { name, skills } of seen) {
  const row = roleLines.find(
    (l) => l.startsWith("| ") && l.split("|")[1]?.trim().replace(/\*\*/g, "").replace(/\s*🆕$/, "").trim() === name,
  );
  if (!row) {
    warn.push(`${name}: agent-roles.md 표에 행이 없다`);
    continue;
  }
  const listed = row.split("|")[5]?.trim() ?? "";
  const want = skills.length ? skills.join(", ") : "—";
  if (listed !== want) warn.push(`${name}: 표"${listed}" ≠ 실제"${want}"`);
}
// 스킬이 실제로 존재하는지도 본다 (구 'domain'·'git-flow' 유령 참조 이력)
for (const { name, skills } of seen) {
  for (const s of skills) {
    if (!existsSync(path.join(ROOT, "shared", "skills", s, "SKILL.md"))) {
      warn.push(`${name}: 존재하지 않는 스킬 '${s}'`);
    }
  }
}
const rosterCount = (readFileSync(ROLES, "utf8").match(/## 로스터 \((\d+)\)/) ?? [])[1];
if (rosterCount && Number(rosterCount) !== files.length) {
  warn.push(`로스터 수 표기 ${rosterCount} ≠ 실제 ${files.length}`);
}
if (warn.length) {
  console.error(`\n⚠️  agent-roles.md drift ${warn.length}건 — 커밋 전에 고쳐라:`);
  for (const w of warn) console.error(`   - ${w}`);
  process.exitCode = 1;
} else {
  console.log("✓ agent-roles.md 표·스킬 참조·로스터 수 일치");
}
