---
name: prepare-release
description: Prepare and manage releases
---

## Available Tools

| Tool | Purpose |
|------|---------|
| `github_list_pull_requests` | List merged PRs for release notes |
| `github_list_commits` | Verify CHANGELOG entries |
| `github_get_pull_request_files` | Review changes in release PR |
| `github_merge_pull_request` | Merge release PR |
| `github_create_pull_request` | Create release branch PR |

## Creating a Release

Use GitHub CLI to create releases:
```bash
gh release create <tag> --title "<title>" --notes "<notes>"
```

## Workflow

1. **Review merged PRs** - List merged PRs since last release
2. **Update CHANGELOG** - Add entries for each significant change
3. **Update version** - Bump version on dev branch BEFORE creating release PR:
   - Update `manifest.json` version field
   - Update `src/core/version.js` CURRENT_VERSION constant
   - Commit with message "chore: bump version to v<x.y.z>"
4. **Acknowledge contributors** - Credit contributors in release notes
5. **Create release PR** - Branch from main, include CHANGELOG and version updates
6. **Review changes** - Verify files changed match expectations
7. **Merge PR** - Use squash merge for clean history
8. **Create tag** - Tag the release commit
9. **Create GitHub release** - Create release with `gh release create`

## Tips

- Update version in both `manifest.json` and `src/core/version.js` before creating release PR
- Use semantic versioning (e.g., v1.2.0)
- Include breaking changes in release notes
- Reference PR numbers in CHANGELOG for context
- Credit contributors in release notes using `gh pr list --merged`