import * as Path from 'path';
import * as optimist from 'optimist';
import { tryGetWorkspaceFromConfig } from './workspace';

export function getOptions() {
  optimist
    .usage('Usage: dynamic-run -w packages')
    .alias('w', 'workspace')
    .alias('r', 'root')
    .describe('w', 'Path to the workspace directory with all projects (relative to the root directory.')
    .describe('r', 'Path to the root directory, if not set the running directory is used. (when set relative, it is relative to the running directory.');

  const argv = optimist.argv;
  const userDefinedWorkspace = argv.w || argv.workspace;
  const workspace: string = userDefinedWorkspace || tryGetWorkspaceFromConfig();
  const userRoot: string = argv.r || argv.root;

  if (!workspace) {
    throw new Error('Workspace not specified and could be detected automatically, please use -w or --workspace');
  }

  const root = userRoot
    ? Path.isAbsolute(userRoot) ? userRoot : Path.join(process.cwd(), userRoot)
    : process.cwd()
  ;

  console.info(`Root Directory: ${root}`);

  if (userDefinedWorkspace) {
    console.info(`Using user-defined workspace: ${userDefinedWorkspace}`);
  } else {
    console.info(`Using inferred workspace: ${workspace}`);
  }


  return { root, workspace };
}
