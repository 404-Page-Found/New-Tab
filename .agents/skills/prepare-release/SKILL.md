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
3. **Create release PR** - Branch from main, include CHANGELOG updates
4. **Review changes** - Verify files changed match expectations
5. **Merge PR** - Use squash merge for clean history
6. **Create tag** - Tag the release commit

## Tips

- Use semantic versioning (e.g., v1.2.0)
- Include breaking changes in release notes
- Reference PR numbers in CHANGELOG for context