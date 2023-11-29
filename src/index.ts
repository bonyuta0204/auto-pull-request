import { getInput, setFailed, debug } from "@actions/core";
import { getOctokit, context } from "@actions/github";

function main() {
  const token = getInput("repo-token");

  const octokit = getOctokit(token);

  const srcBranch = getInput("src-branch");
  const targetBranch = getInput("target-branch");

  if (!srcBranch || !targetBranch) {
    console.error("Source or target branch not specified");
    return;
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
