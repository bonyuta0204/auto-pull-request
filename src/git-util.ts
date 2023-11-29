import simpleGit from "simple-git";

const git = simpleGit();

export async function fetchRemoteBranches() {
  const branches = await git.branch(["-r"]);
  return branches.all.map((branch) => branch.replace("origin/", ""));
}

export async function hasCommitsBetween(
  srcBranch: string,
  targetBranch: string
) {
  const commits = await git.log({
    from: srcBranch,
    to: targetBranch,
  });
  return commits.total > 0;
}
