---
name: gh-issue
description: Create and edit GitHub issues
---

Use GitHub issue tools to manage issues in repositories.

## Available Tools

### github_create_issue
Create a new issue in a repository.

**Required parameters:** owner, repo, title
**Optional parameters:** body, assignees, labels, milestone

**Example:**
```
github_create_issue(owner="username", repo="my-repo", title="Bug in login", body="Description...", labels=["bug"])
```

### github_update_issue
Update an existing issue's title, body, state, labels, or assignees.

**Required parameters:** owner, repo, issue_number
**Optional parameters:** title, body, state, labels, assignees, milestone

**Example:**
```
github_update_issue(owner="username", repo="my-repo", issue_number=1, state="closed", labels=["fixed"])
```

### github_get_issue
Get details of a specific issue including title, body, state, labels, assignees, and comments.

**Required parameters:** owner, repo, issue_number

**Example:**
```
github_get_issue(owner="username", repo="my-repo", issue_number=1)
```

### github_list_issues
List issues in a repository with filtering options.

**Required parameters:** owner, repo
**Optional parameters:** state (open/closed/all), labels, sort (created/updated/comments), direction (asc/desc), since, milestone, assignees, creator, mentioned, per_page, page

**Example:**
```
github_list_issues(owner="username", repo="my-repo", state="open", labels=["bug"])
```

### github_add_issue_comment
Add a comment to an existing issue.

**Required parameters:** owner, repo, issue_number, body

**Example:**
```
github_add_issue_comment(owner="username", repo="my-repo", issue_number=1, body="This is a comment")
```

## Common Patterns

**Create issue with labels:**
```javascript
github_create_issue({
  owner: "username",
  repo: "my-repo",
  title: "Feature request: Dark mode",
  body: "It would be great to have dark mode support...",
  labels: ["enhancement", "feature-request"]
})
```

**Close an issue:**
```javascript
github_update_issue({
  owner: "username",
  repo: "my-repo",
  issue_number: 5,
  state: "closed"
})
```

**Filter issues by label:**
```javascript
github_list_issues({
  owner: "username",
  repo: "my-repo",
  state: "open",
  labels: ["bug"]
})
```

## Tips
- Use descriptive titles that summarize the issue in a few words
- Add detailed body with steps to reproduce for bugs
- Use labels to categorize issues (bug, enhancement, help-wanted, etc.)
- You can assign multiple people to an issue
- Milestones help group issues into releases or projects
