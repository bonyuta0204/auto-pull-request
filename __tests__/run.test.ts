import { setFailed, info } from '@actions/core'
import { run } from '../src/run'
import { fetchRemoteBranches } from '../src/git-util'
import { fetchExistingPullRequest } from '../src/github-utils'
import { vi, expect, describe, it, beforeEach } from 'vitest'

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setFailed: vi.fn(),
  info: vi.fn()
}))

vi.mock('../src/git-util', () => ({
  fetchRemoteBranches: vi.fn(),
  hasCommitsBetween: vi.fn()
}))

vi.mock('../src/github-utils', () => ({
  fetchExistingPullRequest: vi.fn()
}))

describe('main function tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fail if source or target branch is not specified', async () => {
    await run({
      srcBranch: '',
      targetBranch: 'target-branch',
      repoToken: 'dummy-token',
      repo: 'test-repo',
      owner: 'test-owner'
    })

    expect(setFailed).toHaveBeenCalledWith(
      'Source or target branch not specified'
    )
  })

  it('should fail if source branch does not exist', async () => {
    ;(fetchRemoteBranches as any).mockResolvedValue(['valid-branch'])

    await run({
      srcBranch: 'nonexistent-branch',
      targetBranch: 'valid-branch',
      repoToken: 'dummy-token',
      repo: 'test-repo',
      owner: 'test-owner'
    })

    expect(setFailed).toHaveBeenCalledWith(
      'Source branch nonexistent-branch does not exist'
    )
  })

  it('should fail when pull request already exist', async () => {
    const dummyPullRequest = 'https://dummy-pr.com'
    ;(fetchRemoteBranches as any).mockResolvedValue([
      'valid-branch',
      'valid-branch-2'
    ])
    ;(fetchExistingPullRequest as any).mockResolvedValue({
      html_url: dummyPullRequest
    })

    await run({
      srcBranch: 'valid-branch',
      targetBranch: 'valid-branch-2',
      repoToken: 'dummy-token',
      repo: 'test-repo',
      owner: 'test-owner'
    })

    expect(info).toHaveBeenCalledWith(
      `Pull request already exists: ${dummyPullRequest}`
    )
  })
})
