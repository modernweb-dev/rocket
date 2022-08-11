import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { blue } from 'colorette';

const GITHUB_ACTION_FILE_PATH = '.github/workflows';
const GITHUB_DEPLOYMENT_FILE_NAME = 'github-build-and-deploy-rocket-action.yml';
const GITHUB_DEPLOYMENT_FILE_PATH = `../deployments/github-pages/${GITHUB_DEPLOYMENT_FILE_NAME}`;

export async function generateGithubActionsDeployment(newFolderPath) {
  console.log(`${blue('>')} Generating deployment actions...`);

  const githubActionsPath = path.join(newFolderPath, GITHUB_ACTION_FILE_PATH);
  await createDeploymentsFolder(githubActionsPath);

  const githubDeploymentFile = await readFile(
    new URL(GITHUB_DEPLOYMENT_FILE_PATH, import.meta.url),
  );

  const githubDeploymentFileTarget = path.join(
    process.cwd(),
    newFolderPath,
    GITHUB_ACTION_FILE_PATH,
    GITHUB_DEPLOYMENT_FILE_NAME,
  );
  await writeFile(githubDeploymentFileTarget, githubDeploymentFile);
}

async function createDeploymentsFolder(deploymentsPath) {
  if (!existsSync(deploymentsPath)) {
    await mkdir(deploymentsPath, { recursive: true });
  }
}
