# Skills

Agent skills by [@sergical](https://github.com/sergical), in the [Agent Skills](https://agentskills.io/specification) format.

| Skill | What it does |
| --- | --- |
| [product-demo-video](skills/product-demo-video/SKILL.md) | Builds a product demo video in Remotion from stills of a running app, with a brand profile, beat-synced music, and a self-review pass. |

## Install

With [skills.sh](https://skills.sh):

```sh
npx skills add sergical/skills                              # pick skills and agents interactively
npx skills add sergical/skills --skill product-demo-video -g  # one skill, user-wide
```

With [dotagents](https://github.com/getsentry/dotagents), in `agents.toml`:

```toml
[[skills]]
name = "*"
source = "sergical/skills"
path = "skills"
```

Or clone and link the skills you want:

```sh
git clone https://github.com/sergical/skills ~/src/sergical-skills
ln -s ~/src/sergical-skills/skills/product-demo-video ~/.claude/skills/product-demo-video
```

Use `~/.agents/skills/` in place of `~/.claude/skills/` for agents that read that path.

## License

[MIT](LICENSE), except brand assets. The files in `skills/product-demo-video/brands/sentry/` are Sentry brand assets, owned by Sentry and covered by its brand guidelines, not by the MIT license.
