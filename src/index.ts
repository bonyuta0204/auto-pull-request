import { getInput } from '@actions/core'
import { context } from '@actions/github'
import { OptionParams, run } from './run'

const generateOptionParams = (): OptionParams => ({
  srcBranch: getInput('src-branch'),
  targetBranch: getInput('target-branch'),
  title: getInput('title'),
  body: getInput('body'),
  repoToken: getInput('repo-token'),
  repo: context.repo.repo,
  owner: context.repo.owner
})

async function main() {
  run(generateOptionParams())
}

main()
