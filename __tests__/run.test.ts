import { setFailed, info } from '@actions/core'
import { run } from '../src/run'
import { fetchRemoteBranches, hasCommitsBetween } from '../src/git-util'
import {
  addLabelsToPullRequest,
  createPullRequest,
  fetchExistingPullRequest
} from '../src/github-utils'
import { vi, expect, describe, it, beforeEach } from 'vitest'

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setFailed: vi.fn((msg: string) => console.error(msg)),
  info: vi.fn((msg: string) => console.log(msg))
}))

vi.mock('../src/git-util', () => ({
  fetchRemoteBranches: vi.fn(),
  hasCommitsBetween: vi.fn()
}))

vi.mock('../src/github-utils', () => ({
  fetchExistingPullRequest: vi.fn(),
  createPullRequest: vi.fn(),
  addLabelsToPullRequest: vi.fn()
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
      owner: 'test-owner',
      labels: []
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
      owner: 'test-owner',
      labels: []
    })

    expect(setFailed).toHaveBeenCalledWith(
      'Source branch nonexistent-branch does not exist'
    )
  })

  describe('when there is valid diffrence', () => {
    beforeEach(() => {
      ;(fetchRemoteBranches as any).mockResolvedValue([
        'valid-branch',
        'valid-branch-2'
      ])
      ;(hasCommitsBetween as any).mockResolvedValue(true)
    })
    describe('pull request is not created when pull request already exist', async () => {
      const dummyPullRequest = 'https://dummy-pr.com'
      beforeEach(() => {
        ;(fetchExistingPullRequest as any).mockResolvedValue({
          html_url: dummyPullRequest
        })
      })

      it('should not create pull request when there is existing pull request', async () => {
        await run({
          srcBranch: 'valid-branch',
          targetBranch: 'valid-branch-2',
          repoToken: 'dummy-token',
          repo: 'test-repo',
          owner: 'test-owner',
          labels: []
        })

        expect(info).toHaveBeenCalledWith(
          `Pull request already exists: ${dummyPullRequest}`
        )
        expect(createPullRequest).not.toHaveBeenCalled()

        expect(addLabelsToPullRequest).not.toHaveBeenCalled()
      })

      it('should called addLabel request', async () => {
        await run({
          srcBranch: 'valid-branch',
          targetBranch: 'valid-branch-2',
          repoToken: 'dummy-token',
          repo: 'test-repo',
          owner: 'test-owner',
          labels: ['test-label', 'test-label2']
        })

        expect(info).toHaveBeenCalledWith(
          `Pull request already exists: ${dummyPullRequest}`
        )
        expect(createPullRequest).not.toHaveBeenCalled()

        expect(addLabelsToPullRequest).toHaveBeenCalled()
      })
    })

    it('should create pull request when there is no existing pull request', async () => {
      ;(fetchExistingPullRequest as any).mockResolvedValue(undefined)

      await run({
        srcBranch: 'valid-branch',
        targetBranch: 'valid-branch-2',
        repoToken: 'dummy-token',
        repo: 'test-repo',
        owner: 'test-owner',
        labels: []
      })

      expect(createPullRequest).toHaveBeenCalled()
      expect(addLabelsToPullRequest).not.toHaveBeenCalled()
    })

    it('should create pull request and label when there is no existing pull request', async () => {
      ;(fetchExistingPullRequest as any).mockResolvedValue(undefined)
      ;(createPullRequest as any).mockResolvedValue({ pullNumber: 1 })

      await run({
        srcBranch: 'valid-branch',
        targetBranch: 'valid-branch-2',
        repoToken: 'dummy-token',
        repo: 'test-repo',
        owner: 'test-owner',
        labels: ['test-label', 'test-label2']
      })

      expect(createPullRequest).toHaveBeenCalled()
      expect(addLabelsToPullRequest).toHaveBeenCalled()
    })
  })
})
