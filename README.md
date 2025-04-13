# `github-watcher` 

[![Scan GitHub followers](https://github.com/lyluongthien/github-watcher/actions/workflows/update.yml/badge.svg?branch=main&event=workflow_dispatch)](https://github.com/lyluongthien/github-watcher/actions/workflows/update.yml)

The tool for tracking GitHub followers and following lists, forked from [**tuananh/github-followers-watch**](https://github.com/tuananh/github-followers-watch).

## Features

- Fetches GitHub followers and following list
- Automatically runs daily using GitHub Actions
- Outputs results to markdown files
- Handles paginated results
- Built with [Effect](https://effect.website/) for robust functional programming
- Provides a clean CLI interface with [@effect/cli](https://github.com/Effect-TS/effect/tree/main/packages/cli)

## Usage

First, set up your GitHub personal access token in the environment:

```bash
export PERSONAL_ACCESS_TOKEN=your_github_token
```

Then run the commands:

```bash
# Get your followers
pnpm dev ghtool list-followers

# Get users you're following
pnpm dev ghtool list-following
```

For usage help:

```bash
pnpm dev ghtool --help
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

- Node.js v20+
- pnpm
- GitHub Personal Access Token

## Architecture

This application is built using [Effect](https://effect.website/), a powerful functional programming library for TypeScript that provides:

- Robust error handling
- Dependency injection
- Resource management
- Structured concurrency

The CLI interface is powered by [@effect/cli](https://github.com/Effect-TS/effect/tree/main/packages/cli), which offers:

- Type-safe command-line parsing
- Automatic help generation
- Shell completions
- Wizard mode for interactive CLI use
