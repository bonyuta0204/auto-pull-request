import { getInput, setFailed, debug } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import simpleGit from "simple-git";
import { fetchRemoteBranches } from "./git-util";

async function main() {
  const token = getInput("repo-token");

  const octokit = getOctokit(token);

  const srcBranch = getInput("src-branch");
  const targetBranch = getInput("target-branch");

  if (!srcBranch || !targetBranch) {
    console.error("Source or target branch not specified");
    return;
  }

  /**
   * I want to validate that the source branch and target branch actually exist in the repositiory
   */

  const remoteBranches = await fetchRemoteBranches();

  debug(`Remote branches: ${remoteBranches}`);

  if (!remoteBranches.includes(srcBranch)) {
    setFailed(`Source branch ${srcBranch} does not exist`);
  }

  if (!remoteBranches.includes(targetBranch)) {
    setFailed(`Target branch ${targetBranch} does not exist`);
  }

  const { repo, owner } = context.repo;

  const createParam: Parameters<typeof octokit.rest.pulls.create>[0] = {
    owner,
    repo,
    title: `Merge changes from ${srcBranch} to ${targetBranch}`,
    head: srcBranch,
    base: targetBranch,
    body: "Automatically created pull request",
  };

  debug(`Creating pull request: ${JSON.stringify(createParam)}`);

  octokit.rest.pulls
    .create(createParam)
    .then((response) => {
      console.log(`Pull request created: ${response.data.html_url}`);
    })
    .catch((error) => {
      setFailed(`Error creating pull request: ${error.message}`);
    });
}

main();
