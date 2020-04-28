import { execSync } from 'child_process';

export function execute(projectName: string, scriptName: string, args?: string) {
  const cmd = `yarn workspace ${projectName} ${scriptName} ${args || ''}`;
  console.info(`Executing: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' } );
}
