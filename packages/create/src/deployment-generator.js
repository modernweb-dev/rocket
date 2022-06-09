import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { blue } from 'colorette';
import degit from 'degit';

const GITHUB_ACTION_FILE_NAME = 'github-build-and-deploy-rocket-action.yml';

const degitOptions = {
  cache: false,
  force: true,
  verbose: true,
};

export async function generateGithubActionsDeployment(templatePath) {
  console.log(`${blue('>')} Generating deployment actions...`);

  const githubActionsPath = path.join('.', `.github/workflows`);
  const gitHandler = degit(templatePath + GITHUB_ACTION_FILE_NAME, degitOptions);
  await createDeploymentsFolder(githubActionsPath);

  await gitHandler.clone(githubActionsPath + '/' + GITHUB_ACTION_FILE_NAME);
}

async function createDeploymentsFolder(deploymentsPath) {
  if (!existsSync(deploymentsPath)) {
    await mkdir(deploymentsPath, { recursive: true });
  }
}
