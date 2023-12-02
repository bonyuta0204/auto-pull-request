import { setFailed, debug, info } from '@actions/core'
import { getOctokit } from '@actions/github'
import { fetchRemoteBranches, hasCommitsBetween } from './git-util'
import {
  PullRequestDetailItem,
  PullRequestItem,
  createPullRequest,
  fetchExistingPullRequest
} from './github-utils'

export type OptionParams = {
  srcBranch: string
  targetBranch: string
  title?: string
  body?: string
  repoToken: string
  repo: string
  owner: string
  labels: string[]
}

export async function run(options: OptionParams) {
  const { srcBranch, targetBranch, title, body, repoToken, repo, owner } =
    options

  const octokit = getOctokit(repoToken)
  let pullRequest: PullRequestItem | PullRequestDetailItem | undefined =
    undefined

  if (!srcBranch || !targetBranch) {
    setFailed('Source or target branch not specified')
    return
  }

  const remoteBranches = await fetchRemoteBranches()

  if (!remoteBranches.includes(srcBranch)) {
    setFailed(`Source branch ${srcBranch} does not exist`)
    return
  }

  if (!remoteBranches.includes(targetBranch)) {
    setFailed(`Target branch ${targetBranch} does not exist`)
    return
  }

  /** Checks if Pull Request already exists */
  try {
    pullRequest = await fetchExistingPullRequest(
      octokit,
      owner,
      repo,
      srcBranch,
      targetBranch
    )
    if (pullRequest) {
      info(`Pull request already exists: ${pullRequest.html_url}`)
    }
  } catch (error: any) {
    setFailed(`Error checking for existing pull requests: ${error.message}`)
    return
  }

  if (!pullRequest) {
    /** Checks if there are commits between the source and target branch */
    const hasCommits = await hasCommitsBetween(
      `origin/${targetBranch}`,
      `origin/${srcBranch}`
    )
    if (!hasCommits) {
      info(`No commits between ${srcBranch} and ${targetBranch}`)
      return
    }

    pullRequest = await createPullRequest(octokit, {
      owner,
      repo,
      title: title || `Merge changes from ${srcBranch} to ${targetBranch}`,
      head: srcBranch,
      base: targetBranch,
      body: body || 'Automatically created pull request'
    })
  }

  if (!pullRequest) return

  info(`Pull request created: ${pullRequest.html_url}`)
}
