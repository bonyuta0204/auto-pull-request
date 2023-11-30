
# Auto Pull Request: Automated Pull Requests in GitHub Action

## Overview

This GitHub Action, `bonyuta0204/auto-pull-request`, automates the creation of pull requests within your GitHub repository. It streamlines the process of integrating new changes, ensuring a smoother workflow.

## Features
- **Automated PR Creation**: Automatically creates a pull request with a predefined title and body when new commits are detected on a specified branch.

## Getting Started

### Repository Configuration

Before using this action, ensure your repository settings are configured to enable GitHub Actions:

1. Navigate to your repository on GitHub.
2. Go to 'Settings' > 'Actions'.
3. Under 'General', ensure '
      'Allow GitHub Actions to create and approve pull requests' is checked.

This step is crucial for the GitHub Action to have the necessary permissions to create pull requests.

### Usage

1. **Create or Edit a Workflow File**: If you don't have one, create a new workflow file (e.g., `auto-pr.yml`) in `.github/workflows`.

2. **Configure Your Workflow**:
   Insert the following in your workflow file:

   ```yaml
   name: Create PR

   on:
     push:
       branches:
         - release-prd

   jobs:
     auto-pull-request:
       runs-on: ubuntu-latest
       permissions:
           contents: read
           pull-requests: write
       steps:
         - uses: actions/checkout@v4
         - name: auto-pull-request
           uses: bonyuta0204/auto-pull-request@v1
           with:
             src-branch: release-prd
             target-branch: main
   ```

   Note: Setting the correct permissions in the workflow file is mandatory for the action to function properly. Replace `release-prd` and `main` with the specific branches you're working with.


## Configuration Options

This action supports several input options for customization:

- `repo-token`: The GitHub token used to create the pull request. Default is the built-in `github.token`.
- `src-branch`: The source branch for the pull request.
- `target-branch`: The target branch for the pull request. This is a required field.
- `title`: The title for the pull request. If not specified, a default title will be used.
- `body`: The body content for the pull request. If not specified, a default body will be used.

## Contributing

We welcome contributions to enhance this action. Feel free to submit issues and pull requests.
