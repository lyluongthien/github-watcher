# `github-watcher` [![Scan GitHub followers](https://github.com/lyluongthien/github-watcher/actions/workflows/update.yml/badge.svg?branch=main&event=workflow_dispatch)](https://github.com/lyluongthien/github-watcher/actions/workflows/update.yml)

The tool for tracking GitHub followers and following lists, forked from [**tuananh/github-followers-watch**](https://github.com/tuananh/github-followers-watch).

## Features

- Fetches GitHub followers and following list
- Automatically runs daily using GitHub Actions
- Outputs results to markdown files
- Handles paginated results
- Sorts users alphabetically using natural sort

## Usage

First, set up your GitHub personal access token in the environment:

```bash
export PERSONAL_ACCESS_TOKEN=your_github_token
```

Then run the commands:

```bash
# Get your followers
pnpm followers

# Get users you're following
pnpm following
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the project
pnpm build
```

## Requirements

- Node.js v18+
- pnpm
- GitHub Personal Access Token
