---
name: gh-pr
description: Create and manage GitHub pull requests
---

Use GitHub PR tools to create, review, and manage pull requests.

## Available Tools

### github_create_pull_request
Create a new pull request.

**Required parameters:** owner, repo, title, head, base
**Optional parameters:** body, draft, maintainer_can_modify

**Example:**
```
github_create_pull_request(owner="username", repo="my-repo", title="Add dark mode", head="feature-branch", base="main")
```

### github_get_pull_request
Get details of a specific pull request including title, body, state, head/base branches, and review status.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request(owner="username", repo="my-repo", pull_number=1)
```

### github_list_pull_requests
List PRs in a repository with filtering options.

**Required parameters:** owner, repo
**Optional parameters:** state (open/closed/all), head, base, sort (created/updated/popularity/long-running), direction (asc/desc), per_page, page

**Example:**
```
github_list_pull_requests(owner="username", repo="my-repo", state="open", base="main")
```

### github_merge_pull_request
Merge a pull request.

**Required parameters:** owner, repo, pull_number
**Optional parameters:** commit_title, commit_message, merge_method (merge/squash/rebase)

**Example:**
```
github_merge_pull_request(owner="username", repo="my-repo", pull_number=1, merge_method="squash")
```

### github_update_pull_request_branch
Update a PR branch with the latest changes from the base branch.

**Required parameters:** owner, repo, pull_number
**Optional parameters:** expected_head_sha

**Example:**
```
github_update_pull_request_branch(owner="username", repo="my-repo", pull_number=1)
```

### github_get_pull_request_status
Get the combined status of all checks for a PR.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_status(owner="username", repo="my-repo", pull_number=1)
```

### github_get_pull_request_files
Get the list of files changed in a PR.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_files(owner="username", repo="my-repo", pull_number=1)
```

### github_get_pull_request_reviews
Get reviews on a pull request.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_reviews(owner="username", repo="my-repo", pull_number=1)
```

### github_get_pull_request_comments
Get review comments on a pull request.

**Required parameters:** owner, repo, pull_number

**Example:**
```
github_get_pull_request_comments(owner="username", repo="my-repo", pull_number=1)
```

### github_create_pull_request_review
Create a review on a pull request.

**Required parameters:** owner, repo, pull_number, body, event (APPROVE/REQUEST_CHANGES/COMMENT)
**Optional parameters:** comments, commit_id

**Example:**
```
github_create_pull_request_review(owner="username", repo="my-repo", pull_number=1, body="LGTM!", event="APPROVE")
```

## Common Patterns

**Create a PR:**
```javascript
github_create_pull_request({
  owner: "username",
  repo: "my-repo",
  title: "Add new feature",
  head: "feature-branch",
  base: "main",
  body: "## Summary\n- Added new feature\n- Updated tests"
})
```

**Check PR status before merging:**
```javascript
github_get_pull_request_status({
  owner: "username",
  repo: "my-repo",
  pull_number: 1
})
```

**Merge with squash:**
```javascript
github_merge_pull_request({
  owner: "username",
  repo: "my-repo",
  pull_number: 1,
  merge_method: "squash",
  commit_message: "Add new feature (#1)"
})
```

**Request changes on a PR:**
```javascript
github_create_pull_request_review({
  owner: "username",
  repo: "my-repo",
  pull_number: 1,
  body: "Please fix the styling issues",
  event: "REQUEST_CHANGES",
  comments: [
    { path: "src/styles.css", line: 10, body: "Use consistent indentation" }
  ]
})
```

## Tips
- Use `head` for your feature branch and `base` for the target branch
- Set `draft: true` for work-in-progress PRs
- Use descriptive titles and detailed body descriptions
- Check status before merging to ensure all tests pass
- Use squash merge for clean commit history
- Add reviewers using the review tools after creating the PR
