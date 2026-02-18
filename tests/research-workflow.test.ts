import path from "node:path";
import { readFile } from "node:fs/promises";
import { loadWorkflowSpec } from "../dist/installer/workflow-spec.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const WORKFLOW_DIR = path.resolve(import.meta.dirname, "..", "workflows", "research-workflow");
const WORKFLOW_YML = path.join(WORKFLOW_DIR, "workflow.yml");

describe("research-workflow", () => {
  it("has expected id, polling config, and pipeline structure", async () => {
    const spec = await loadWorkflowSpec(WORKFLOW_DIR);
    assert.equal(spec.id, "research-workflow");
    assert.equal(spec.polling?.model, "default");
    assert.equal(spec.polling?.timeoutSeconds, 120);
    assert.deepEqual(spec.agents.map((a) => a.id), ["strategist", "writer", "reviewer"]);
    assert.deepEqual(spec.steps.map((s) => s.id), ["classify", "review", "draft", "review-sim", "quality-gate"]);
  });

  it("explicitly requires literature matrix and full manuscript writing", async () => {
    const raw = await readFile(WORKFLOW_YML, "utf-8");
    assert.match(raw, /\| Author \| Year \| Method \| Dataset \| Key Findings \| Limitations \|/);
    assert.match(raw, /A full research paper draft/);
    assert.match(raw, /A standalone literature review draft/);
    assert.match(raw, /Mandatory limitations and future work section/);
    assert.match(raw, /Every claim cited/);
    assert.match(raw, /No uncited assertions/);
  });
});
