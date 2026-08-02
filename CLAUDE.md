# Project notes

## Org-level skills — read these first

The skills shared by every CLET-GSL-DEV repo live **once**, at the org root:
`~/mm/CLET-GSL-DEV/.claude/skills/`. They are the source of truth for everything transferable, and
they are auto-discovered when you work from inside the org folder.

| Skill | Read before |
| --- | --- |
| `frontend-architecture` | **Start here.** Monorepo shape, stack, hard rules, env model, Zitadel auth, endpoint factory, state, routing, module structure |
| `api-integration` | Any API call — includes the automatic JSON -> multipart FormData system for uploads |
| `error-handling` | Any mutation, query, error UI or toast |
| `ui-patterns` | Any component, page, layout, table, modal or form |
| `portals` | Portal routing, the role model, or an app/package split |
| `env-changes` | Changing ANY environment variable |
| `zitadel-auth` | Wiring auth, changing a redirect/post-logout URI, debugging a login bounce or logout |
| `swagger-api` | Generating endpoints from an OpenAPI spec |
| `backend` | Running a backend locally, Zitadel wiring, backend review |
| `canonical-sources` | **Copying any page/component/system between repos** |

Global (`~/.claude/skills/`): `git-workflow`, `zitadel-setup`, `test-m2m`, `doc-to-markdown`.

**Precedence.** The org skill wins for anything transferable. The repo-local skills below are
**repo-specific additions only**. Where a repo-local skill genuinely contradicts an org skill, the
repo wins *for this repo* — and the contradiction must be called out explicitly in that skill.

Where a repo still holds its own generic copy of `api-integration`, `architecture`, `ui-patterns`,
`portals`, `project` or `swagger-api`, that copy is a legacy duplicate of the org skill — prefer the
org version, and do not create new ones.


<!-- rfdtech-ui -->
Before writing UI code, see `.claude/skills/rfdtech-ui/SKILL.md` for `@rfdtech/components` conventions (search components, use authoritative types, follow the rules). Given a screenshot, image, mockup, or description of a screen to build, see `.claude/skills/image-to-components/SKILL.md` first.
