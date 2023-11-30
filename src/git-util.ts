import { debug, info } from "@actions/core";
import { readdir, access } from "fs/promises";
import * as path from "path";
import simpleGit from "simple-git";

const git = simpleGit();

/**
 * Fetches all commits from the remote repository
 */
export async function fullFetch(): Promise<void> {
  return access(path.join(".git", "shallow"))
    .then(async () => {
      debug("Repository is shallow, fetching all commits");
      await git.fetch(["--unshallow"]);
    })
    .catch(async () => {
      debug("Repository is complete, fetching commits");
      await git.fetch([]);
    });
}

export async function fetchRemoteBranches() {
  await fullFetch();
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
