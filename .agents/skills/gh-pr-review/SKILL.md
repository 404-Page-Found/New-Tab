---
name: gh-pr-review
description: Create and manage PR reviews
---

Use GitHub PR review tools to review pull requests, add comments, and provide feedback.

## Available Tools

### github_create_pull_request_review
Create a review on a pull request with comments, approval, or change requests.

**Required parameters:** owner, repo, pull_number, body, event
**Event values:** APPROVE, REQUEST_CHANGES, COMMENT
**Optional parameters:** comments, commit_id

**Example:**
```
github_create_pull_request_review(owner="username", repo="my-repo", pull_number=1, body="Great work!", event="APPROVE")
```

### github_get_pull_request_reviews
Get all reviews on a pull request, including reviewer information and their decisions.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_reviews(owner="username", repo="my-repo", pull_number=1)
```

### github_get_pull_request_comments
Get review comments on a pull request (comments on specific lines of code).

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_comments(owner="username", repo="my-repo", pull_number=1)
```

### github_get_pull_request_files
Get the list of files changed in a pull request.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_files(owner="username", repo="my-repo", pull_number=1)
```

### github_get_pull_request_status
Get the combined status of all checks (CI tests, linting, etc.) for a PR.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_status(owner="username", repo="my-repo", pull_number=1)
```

## Common Patterns

### Approve a PR
```javascript
github_create_pull_request_review({
  owner: "username",
  repo: "my-repo",
  pull_number: 1,
  body: "LGTM! Nice work on this feature.",
  event: "APPROVE"
})
```

### Request changes with inline comments
```javascript
github_create_pull_request_review({
  owner: "username",
  repo: "my-repo",
  pull_number: 1,
  body: "Please address the following issues:",
  event: "REQUEST_CHANGES",
  comments: [
    { path: "src/utils.js", line: 42, body: "Consider using const instead of let here" },
    { path: "src/utils.js", line: 55, body: "This function should handle the edge case where input is null" }
  ]
})
```

### Add general comments without approval or request
```javascript
github_create_pull_request_review({
  owner: "username",
  repo: "my-repo",
  pull_number: 1,
  body: "Have you considered using a different approach for this? Otherwise looks good.",
  event: "COMMENT"
})
```

### Check if PR is ready to merge
```javascript
// First get the files to understand what changed
github_get_pull_request_files({
  owner: "username",
  repo: "my-repo",
  pull_number: 1
})

// Then check if all tests pass
github_get_pull_request_status({
  owner: "username",
  repo: "my-repo",
  pull_number: 1
})
```

### View existing reviews
```javascript
github_get_pull_request_reviews({
  owner: "username",
  repo: "my-repo",
  pull_number: 1
})
```

## Review Event Types

| Event | Description |
|-------|-------------|
| APPROVE | Approve the PR - ready to merge |
| REQUEST_CHANGES | Request changes before merge |
| COMMENT | General comment without approval |

## Inline Comment Format

When adding inline comments, use either:
- `position`: The position in the diff (not recommended)
- `line`: The line number in the file (preferred)

```javascript
comments: [
  { path: "src/index.js", line: 10, body: "This looks good" }
]
```

## Tips
- Always check the PR status before approving to ensure tests pass
- Review all changed files before submitting your review
- Use REQUEST_CHANGES for issues that must be fixed
- Use COMMENT for suggestions or questions that aren't blockers
- Be constructive and specific in your feedback
- Point to specific lines when suggesting changes
- Check for consistent code style and naming conventions
- Verify tests are included for new functionality
