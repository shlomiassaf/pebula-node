import * as Path from 'path';
import * as inquirer from 'inquirer';
import { getAllAvailableProjects } from './workspace';
import { getOptions } from './options';
import { execute } from './exec';

async function selectProject() {
  const projects = getAllAvailableProjects(Path.join(root, workspace), true);
  if (projects.length > 0) {
    const result = await inquirer
      .prompt([
        {
          type: 'list',
          name: 'project',
          message: 'Select project to run:',
          choices: projects.map( p => p.pkgJson.name ),
        }
      ]);
    return result && projects.find( p => p.pkgJson.name === result.project );
  }
}

async function selectScript(scripts: string[]) {
  const result = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'script',
        message: 'Select script to run:',
        choices: scripts,
      }
    ]);

  return result && result.script as string;
}

const { root, workspace } = getOptions();

async function run() {
  const project = await selectProject();
  if (!project) {
    return;
  }

  const script = await selectScript(project.scripts);
  if (!script) {
    return;
  }

  const argsInput = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'args',
        message: 'Additional command arguments?',
      }
    ]);

  execute(project.pkgJson.name, script, argsInput.args)
}

run();
