---
name: gh-create-edit-pr
description: Create and manage GitHub pull requests
---

Use GitHub PR tools:
- `github_create_pull_request` - Create a new pull request
- `github_get_pull_request` - Get PR details
- `github_list_pull_requests` - List PRs (filter by state, head, base)
- `github_merge_pull_request` - Merge a PR
- `github_update_pull_request_branch` - Update PR branch with latest base

Required parameters: owner, repo, title, head, base (for create)