---
name: gh-issue
description: Create and edit GitHub issues
---

Use GitHub issue tools:
- `github_create_issue` - Create a new issue in a repository
- `github_update_issue` - Update an existing issue (title, body, state, labels, assignees)
- `github_get_issue` - Get details of a specific issue

Required parameters: owner, repo, title (for create), issue_number (for update/get)