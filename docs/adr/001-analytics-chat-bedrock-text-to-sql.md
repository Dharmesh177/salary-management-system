# ADR 001: Salary Analytics Chat — Text-to-SQL via AWS Bedrock

| Field | Value |
| ----- | ----- |
| **Status** | Accepted |
| **Date** | 2026-03-09 |
| **Feature** | Optional stretch — Salary Analytics Chat |
| **Scope** | Natural-language Q&A over employee/compensation SQLite data |

---

## Context

HR Managers need to ask ad-hoc analytics questions (e.g. *average compensation of engineers in India*) without building a new report for each question. The MVP already stores employees, salaries, and FX rates in SQLite and exposes fixed dashboard aggregations.

Requirements for the stretch feature:

- LLM converts questions to SQL, but **must not** have direct database access
- Read-only, validated SQL only
- Answers grounded in query results
- No RAG/vector DB for schema (schema is small)
- No AI conversation tables
- Must not break existing Employee Directory, Salary Management, or Dashboard
- Testable without live LLM calls

---

## Decision

Implement **text-to-SQL with a controlled tool gate** using **AWS Bedrock Converse API**.

### Architecture

```
Question → Service → Bedrock (SQL JSON) → Validator → Tool → Repository → SQLite
                → Bedrock (Answer JSON) ← query rows only
```

### Key choices

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| LLM provider | AWS Bedrock Converse | Team has AWS credits; no OpenAI account required |
| Schema delivery | Static prompt context + 2 few-shot examples | Schema fits in context; RAG adds complexity without benefit |
| DB access | Repository only, after `sql-validator.js` | LLM proposes; application executes |
| SQL validation | Deterministic allowlist validator | Defense in depth beyond prompt instructions |
| Retry | Up to 2 LLM corrections on **DB execution errors only** | Fixes column/join mistakes; validation failures fail fast |
| Persistence | None (stateless requests) | No requirement for chat history; simpler demo and ops |
| Feature flag | `503` when `AWS_REGION` / `BEDROCK_MODEL_ID` unset | Core MVP runs without AWS |
| Nova 2 models | Auto-map to geo inference profile IDs | Bedrock rejects raw `amazon.nova-2-*` on-demand IDs |

---

## Alternatives considered

### 1. OpenAI Chat Completions

- **Pros:** Simple API, widely documented
- **Cons:** Requires separate OpenAI billing; team uses AWS credits
- **Rejected:** Switched to Bedrock after provider preference

### 2. RAG over schema documentation

- **Pros:** Scales to large schemas
- **Cons:** 6 tables, stable schema; adds embedding pipeline and vector store
- **Rejected:** Explicit non-goal in requirements

### 3. ORM / query builder instead of raw generated SQL

- **Pros:** Stronger typing, no arbitrary SQL
- **Cons:** Cannot express open-ended analytics questions without building a query DSL
- **Rejected:** Text-to-SQL matches the stretch goal and interview narrative

### 4. Persist conversations in `ai_messages` table

- **Pros:** Chat history, audit trail
- **Cons:** No product requirement; migration + privacy scope
- **Rejected:** Stateless API sufficient for demo

### 5. LLM executes SQL directly (agent with DB tool unguarded)

- **Pros:** Fewer layers
- **Cons:** Unacceptable security risk (writes, exfiltration, multi-statement)
- **Rejected:** Mandatory validator + allowlist

### 6. Unlimited SQL correction loop

- **Pros:** Higher success rate on hard questions
- **Cons:** Cost, latency, infinite loop risk
- **Rejected:** Cap at 2 corrections (3 executions max)

---

## Consequences

### Positive

- Clear separation: **LLM reasons**, **code enforces**
- Feature is isolated under `features/analytics-chat/` — no changes to dashboard SQL
- Full test coverage with mocked LLM and real SQLite for repository/tool
- Disabled by default when Bedrock env vars missing

### Negative / trade-offs

- **Latency:** 2–3 Bedrock calls per question (SQL + optional correction + answer)
- **Cost:** Per-token Bedrock usage on AWS account
- **Correctness:** LLM may still produce wrong SQL that passes validator but returns misleading aggregates — mitigated by grounded answer step and demo SQL visibility
- **Deploy on Render:** Requires static AWS IAM keys (no instance role)
- **Nova 2 operational detail:** Must use inference profile IDs (`us.amazon.*`)

### Risks and mitigations

| Risk | Mitigation |
| ---- | ---------- |
| SQL injection via LLM | SELECT-only, keyword blocklist, table allowlist, LIMIT cap |
| Hallucinated numbers in answer | Answer prompt restricted to query JSON; empty result handling |
| Bedrock outage | 502/504 errors surfaced to UI |
| Validator bypass | Single execution path through `execute-analytics-query.tool.js` |

---

## Compliance with MVP constraints

- Does not modify employee/salary/dashboard feature code paths
- Reuses existing `exchange_rates` and compensation formulas aligned with dashboard
- Auth reuses existing JWT middleware
- One new npm dependency: `@aws-sdk/client-bedrock-runtime`

---

## References

- Feature guide: [salary-analytics-chat.md](../salary-analytics-chat.md)
- Diagram: [salary-analytics-chat.drawio](../diagrams/salary-analytics-chat.drawio)
- AWS Bedrock Converse: https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
- Nova 2 inference profiles: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-lite.html
