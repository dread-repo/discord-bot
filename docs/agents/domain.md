# Domain docs

How agents should consume domain documentation in this repo.

**Hub:** [README.md](README.md), [orchestration.md](orchestration.md).

## Before exploring, read these

- **`CONTEXT.md`** at the repo root
- **`docs/adr/`** for decisions that touch your area
- **`docs/ROADMAP.md`** for planned work (not necessarily shipped)

If any file does not exist yet, proceed without asking to create it unless the user requested glossary or ADR work.

## File structure

```text
/
├── CONTEXT.md
├── docs/adr/
├── specs/          # Spec Kit features (NNN-name)
└── src/            # TBD
```

## Use glossary vocabulary

When naming domain concepts in issues, PRs, or tests, use terms from `CONTEXT.md`. Avoid synonyms the glossary marks as `_Avoid_:`.

## Flag ADR conflicts

If implementation contradicts an ADR, say so explicitly:

> Contradicts ADR-NNNN (...). Worth reopening because ...

## Project-specific notes

- Prefer Discord interaction terminology (slash commands, guild) over generic web API wording unless discussing the Gateway HTTP surface.
- Spec Kit artifacts under `specs/` are the source of truth for in-flight features tied to `.specify/feature.json`.
