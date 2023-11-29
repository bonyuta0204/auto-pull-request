import core from "@actions/core";

const srcBranch = core.getInput("src-branch");

console.log(srcBranch);
