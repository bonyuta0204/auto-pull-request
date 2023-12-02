import { getOctokit } from '@actions/github'

export async function fetchExistingPullRequest(
  octokit: ReturnType<typeof getOctokit>,
  owner: string,
  repo: string,
  srcBranch: string,
  targetBranch: string
) {
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
