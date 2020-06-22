import * as core from "@actions/core";
import { exec } from "@actions/exec";

const run = async () => {
  try {
    const dockerfilePath = core.getInput("dockerfile");
    const contextPath = core.getInput("context");

    const env = {
      DOCKER_BUILDKIT: "1",
    };

    const args = ["build", "--build-arg", "BUILDKIT_INLINE_CACHE=1"];
    if (dockerfilePath) {
      args.push("--file", dockerfilePath);
    }

    if (contextPath) {
      args.push(contextPath);
    } else {
      args.push(".");
    }

    await exec("docker", args, { env });
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
