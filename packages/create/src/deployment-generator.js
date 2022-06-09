import { existsSync, readFileSync, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { blue } from 'colorette';

const GITHUB_ACTION_FILE_PATH = '.github/workflows';
const GITHUB_DEPLOYMENT_FILE_NAME = 'github-build-and-deploy-rocket-action.yml';
const GITHUB_DEPLOYMENT_FILE_PATH = `./deployments/github-pages/${GITHUB_DEPLOYMENT_FILE_NAME}`;

export async function generateGithubActionsDeployment(newFolderPath) {
  console.log(`${blue('>')} Generating deployment actions...`);

  const githubActionsPath = path.join(newFolderPath, GITHUB_ACTION_FILE_PATH);
  await createDeploymentsFolder(githubActionsPath);

  const githubDeploymentFile = readFileSync(path.join('.', GITHUB_DEPLOYMENT_FILE_PATH));

  const githubDeploymentFileTarget = path.join(
    '.',
    newFolderPath,
    GITHUB_ACTION_FILE_PATH
    GITHUB_DEPLOYMENT_FILE_NAME,
  );
  writeFileSync(githubDeploymentFileTarget, githubDeploymentFile);
}

async function createDeploymentsFolder(deploymentsPath) {
  if (!existsSync(deploymentsPath)) {
    await mkdir(deploymentsPath, { recursive: true });
  }
}
