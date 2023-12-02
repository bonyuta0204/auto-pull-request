import { debug, setFailed } from '@actions/core'
import { getOctokit } from '@actions/github'

type OctoKit = ReturnType<typeof getOctokit>

type PullRequestCreateParam = Parameters<OctoKit['rest']['pulls']['create']>[0]

type issueAddLabelsParam = Parameters<OctoKit['rest']['issues']['addLabels']>[0]

/** Pull Request response in list API */
export type PullRequestItem = Awaited<
  ReturnType<OctoKit['rest']['pulls']['list']>
>['data'][number]

/** Pull Request response in detail API */
export type PullRequestDetailItem = Awaited<
  ReturnType<OctoKit['rest']['pulls']['create']>
>['data']

export async function fetchExistingPullRequest(
  octokit: OctoKit,
  owner: string,
  repo: string,
  srcBranch: string,
  targetBranch: string
): Promise<PullRequestItem | undefined> {
  const pulls = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    head: `${owner}:${srcBranch}`,
    base: targetBranch
  })
  if (pulls.data.length > 0) {
    return pulls.data[0]
  }
}

export async function createPullRequest(
  octokit: OctoKit,
  createParam: PullRequestCreateParam
) {
  debug(`Creating pull request: ${JSON.stringify(createParam)}`)
  try {
    const response = await octokit.rest.pulls.create(createParam)
    return response.data
  } catch (error: any) {
    setFailed(`Error creating pull request: ${error.message}`)
  }
}

/** Add labels to pull request */
export async function addLabelsToPullRequest(
  octokit: OctoKit,
  param: issueAddLabelsParam
) {
  debug(`Adding labels to pull request: ${JSON.stringify(param)}`)
  try {
    const response = await octokit.rest.issues.addLabels(param)
    return response.data
  } catch (error: any) {
    setFailed(`Error adding labels to pull request: ${error.message}`)
  }
}
