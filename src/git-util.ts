import simpleGit from "simple-git";

const git = simpleGit();

export async function fetchRemoteBranches() {
  const branches = await git.branch(["-r"]);
  return branches.all.map((branch) => branch.replace("origin/", ""));
}
