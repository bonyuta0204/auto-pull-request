import { debug, getInput, info } from '@actions/core'
import { context } from '@actions/github'
import { OptionParams, run } from './run'

/**
 * Generates the option parameters for the auto-pull-request.
 * @returns {OptionParams} The generated option parameters.
 */
const generateOptionParams = (): OptionParams => ({
  srcBranch: getInput('src-branch'),
  targetBranch: getInput('target-branch'),
  title: getInput('title'),
  body: getInput('body'),
  /** input is a comma-separated list */
  labels: getInput('labels')
    .split(',')
    .map((label) => label.trim())
    .filter((label) => label !== ''),
  repoToken: getInput('repo-token'),
  repo: context.repo.repo,
  owner: context.repo.owner
})

async function main() {
  debug(`running with parameters: ${JSON.stringify(generateOptionParams())}`)
  run(generateOptionParams())
}

main()
