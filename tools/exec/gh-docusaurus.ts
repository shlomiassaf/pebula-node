import * as Path from 'path';
import { execute, ExecPluginConfig, registerPlugin } from './_utils';

declare module './_utils' {
  export interface ExecPluginConfig {
    ghDocusaurus?: boolean | string | string[];
  }
}

const PLUGIN_NAME: keyof ExecPluginConfig = 'ghDocusaurus';
    
registerPlugin(PLUGIN_NAME, analyzed => {
  const value = analyzed.execPluginValue<'ghDocusaurus'>(PLUGIN_NAME);
  const segments = typeof value === 'boolean'
    ? []
    : Array.isArray(value) ? value : [value]
  ;

  const child = analyzed.cloneChildren(...segments)
  if (!child) {
    throw new Error(`Invalid ExecPluginConfig for "${PLUGIN_NAME}". Reference to sub-package ${Path.join(...segments)} is invalid.`);
  }
  const docusaurus = child.binaryPath('libRoot', 'docusaurus');
  const outPath = child.pathJoin('lernaRoot', '.gh-pages-build', analyzed.name.name);
  const cmd = `${docusaurus} build --out-dir ${outPath}`;
  console.log(`Execute Plugin: ${cmd}`);
  execute(cmd, { cwd: child.libRoot });
});
