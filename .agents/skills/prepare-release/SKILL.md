---
name: prepare-release
description: Prepare and manage releases
---

Release workflow tools:
- `github_merge_pull_request` - Merge release PR (commit_title, commit_message, merge_method)
- `github_list_commits` - List commits to verify CHANGELOG
- `github_list_pull_requests` - Check merged PRs for release notes
- `github_get_pull_request_files` - Review changes in release PR
- `github_create_pull_request` - Create release branch PR

For creating GitHub releases, use the GitHub MCP server or CLI with:
```bash
gh release create <tag> [flags]
```

Typical workflow: 1) Review merged PRs, 2) Update changelog, 3) Create/release PR, 4) Merge, 5) Create git tag