---
name: gh-pr-review
description: Create and manage PR reviews
---

Use GitHub review tools:
- `github_create_pull_request_review` - Add comments, approve, or request changes to a PR
- `github_get_pull_request_reviews` - Get all reviews on a PR
- `github_get_pull_request_comments` - Get review comments on a PR
- `github_get_pull_request_files` - Get files changed in a PR
- `github_get_pull_request_status` - Get combined status checks

Required parameters: owner, repo, pull_number, body, event (APPROVE/REQUEST_CHANGES/COMMENT)