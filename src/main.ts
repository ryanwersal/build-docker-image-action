import * as core from "@actions/core";
import { exec } from "@actions/exec";

interface BuildImageContext {
  image: string;
  tag: string;
  target?: string;
  dockerfilePath?: string;
  contextPath: string;
}

const buildImage = async ({
  image,
  tag,
  target,
  dockerfilePath,
  contextPath,
}: BuildImageContext) => {
  const env = {
    DOCKER_BUILDKIT: "1",
  };

  const imageName = `${image}:${tag}`;

  const args = [
    "build",
    "--tag",
    imageName,
    "--build-arg",
    "BUILDKIT_INLINE_CACHE=1",
  ];
  if (dockerfilePath) {
    args.push("--file", dockerfilePath);
  }

  if (target) {
    args.push("--target", target);
  }

  args.push(contextPath);

  await exec("docker", args, { env });

  return imageName;
};

interface LoginRegistryContext {
  registry: string;
  username: string;
  password: string;
}

const loginToRegistry = async ({
  registry,
  username,
  password,
}: LoginRegistryContext) => {
  const env = {
    DOCKER_BUILDKIT: "1",
  };

  const args = ["login", registry, "--username", username, "--password-stdin"];

  await exec("docker", args, { env, input: Buffer.from(password) });
};

interface LogoutRegistryContext {
  registry: string;
}

const logoutOfRegistry = async ({ registry }: LogoutRegistryContext) => {
  const env = {
    DOCKER_BUILDKIT: "1",
  };

  const args = ["logout", registry];

  await exec("docker", args, { env });
};

interface TagImageContext {
  imageName: string;
  registry: string;
  namespace: string;
}

const tagImage = async ({
  imageName,
  registry,
  namespace,
}: TagImageContext) => {
  const env = {
    DOCKER_BUILDKIT: "1",
  };

  const registryImageName = `${registry}/${namespace}/${imageName}`;

  const args = ["tag", imageName, registryImageName];
  await exec("docker", args, { env });

  return registryImageName;
};

interface PushImageContext {
  registryImageName: string;
}

const pushImage = async ({ registryImageName }: PushImageContext) => {
  const env = {
    DOCKER_BUILDKIT: "1",
  };

  const args = ["push", registryImageName];
  await exec("docker", args, { env });
};

const run = async () => {
  const registry = core.getInput("registry", { required: true });

  try {
    const namespace =
      core.getInput("namespace") || process.env.GITHUB_REPOSITORY || "";
    const username =
      core.getInput("username") || process.env.GITHUB_ACTOR || "";
    const password = core.getInput("password", { required: true });
    const dockerfilePath = core.getInput("dockerfile");
    const contextPath = core.getInput("context") || ".";
    const image = core.getInput("image", { required: true });
    const tag = core.getInput("tag", { required: true });
    const target = core.getInput("target");

    core.setSecret(password);

    await loginToRegistry({ registry, username, password });

    const imageName = await buildImage({
      image,
      tag,
      target,
      dockerfilePath,
      contextPath,
    });

    const registryImageName = await tagImage({
      imageName,
      registry,
      namespace,
    });

    await pushImage({
      registryImageName,
    });
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    await logoutOfRegistry({ registry });
  }
};

run();
