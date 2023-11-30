import { setFailed } from '@actions/core'
import { run } from '../src/index' // Replace with the actual file name
import { fetchRemoteBranches } from '../src/git-util'
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
})
