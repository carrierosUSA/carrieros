# Transpo.ai — Agent instructions

## Follow `/constitution` first

Before implementing any feature, read:

1. [`constitution/00-master-constitution.md`](./constitution/00-master-constitution.md) — **Master Constitution Version 1.0 — highest authority**
2. [`constitution/INDEX.md`](./constitution/INDEX.md) — full precedence

## Conflict protocol

If a request conflicts with the Constitution:

1. **DO NOT implement** the conflicting path.
2. Explain the risk and why it conflicts.
3. Recommend safer, simpler, more maintainable, more secure alternatives.
4. Ask when uncertain.

**The Constitution always overrides feature requests.**

## Precedence

1. Master Constitution Version 1.0
2. Trust & Safety Charter
3. Foundation
4. Engineering Constitution
5. AI Safety & Legal Policy
6. Product Design (UI only)

Historical appendix: [`constitution/00a-permanent-constitution.md`](./constitution/00a-permanent-constitution.md) (superseded; does not outrank Master).

Cursor rules summarize; **`/constitution` wins on conflict**. Product hub: `/platform/governance`.

## Do not

- Rebuild the app to satisfy a feature ask.
- Invent parallel AI/approval gates that weaken the Constitution.
- Ship flashy or short-term hacks over trustworthy, maintainable systems.
