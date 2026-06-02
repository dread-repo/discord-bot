# Architecture decision records (ADRs)

Short, durable decisions for **discord-bot**. Number files sequentially: `0001-title.md`, `0002-title.md`, ...

## When to write an ADR

- Public command or API contract changes
- Auth, permissions, or data retention policy
- Deployment or hosting choices that are hard to reverse

## Template

```markdown
# ADR-NNNN: Title

## Status

Proposed | Accepted | Superseded by ADR-XXXX

## Context

What problem are we solving?

## Decision

What we chose.

## Consequences

Positive and negative outcomes.
```

Agents: read relevant ADRs before implementing; flag conflicts in PRs. See [docs/agents/domain.md](../agents/domain.md).
