import core from "@actions/core";
import { getOctokit } from "@actions/github";

function main() {
  const token = core.getInput("repo-token");

  const octokit = getOctokit(token);

  const srcBranch = core.getInput("src-branch");
  const targetBranch = core.getInput("target-branch");

  if (!srcBranch || !targetBranch) {
    console.error("Source or target branch not specified");
    return;
  }

  // Assuming the context of the action has repository information
  const owner = process.env.GITHUB_REPOSITORY_OWNER || "";
  const repo = (process.env.GITHUB_REPOSITORY || "").split("/")[1];

  octokit.rest.pulls
    .create({
      owner,
      repo,
      title: `Merge changes from ${srcBranch} to ${targetBranch}`,
      head: srcBranch,
      base: targetBranch,
      body: "Automatically created pull request",
    })
    .then((response) => {
      console.log(`Pull request created: ${response.data.html_url}`);
    })
    .catch((error) => {
      console.error(`Error creating pull request: ${error.message}`);
    });
}

main();
