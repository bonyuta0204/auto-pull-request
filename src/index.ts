import { getInput, setFailed, debug, info } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import simpleGit from "simple-git";
import { fetchRemoteBranches, hasCommitsBetween } from "./git-util";

async function main() {
  const token = getInput("repo-token");

  const octokit = getOctokit(token);

  const srcBranch = getInput("src-branch");
  const targetBranch = getInput("target-branch");

  const { repo, owner } = context.repo;

  if (!srcBranch || !targetBranch) {
    setFailed("Source or target branch not specified");
    return;
  }

  const remoteBranches = await fetchRemoteBranches();

  if (!remoteBranches.includes(srcBranch)) {
    setFailed(`Source branch ${srcBranch} does not exist`);
    return;
  }

  if (!remoteBranches.includes(targetBranch)) {
    setFailed(`Target branch ${targetBranch} does not exist`);
    return;
  }

  /** Checks if Pull Request already exists */
  try {
    const pulls = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open",
      head: `${owner}:${srcBranch}`,
      base: targetBranch,
    });
    if (pulls.data.length > 0) {
      info(`Pull request already exists: ${pulls.data[0].html_url}`);
      return;
    }
  } catch (error: any) {
    setFailed(`Error checking for existing pull requests: ${error.message}`);
  }

  /** Checks if there are commits between the source and target branch */
  const hasCommits = await hasCommitsBetween(
    `origin/${srcBranch}`,
    `origin/${targetBranch}`,
  );
  if (!hasCommits) {
    info(`No commits between ${srcBranch} and ${targetBranch}`);
    return;
  }

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
