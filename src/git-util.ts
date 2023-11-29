import { debug } from "@actions/core";
import simpleGit from "simple-git";

const git = simpleGit();

export async function fetchRemoteBranches() {
  await git.fetch(["--unshallow"]);
  const branches = await git.branch(["-r"]);
  return branches.all.map((branch) => branch.replace("origin/", ""));
}

export async function hasCommitsBetween(
  srcBranch: string,
  targetBranch: string,
) {
  const commits = await git.log({
    from: srcBranch,
    to: targetBranch,
    symmetric: false,
  });
  debug(
    `Commits between ${srcBranch} and ${targetBranch}: ${JSON.stringify(
      commits,
    )}`,
  );
  return commits.total > 0;
}
