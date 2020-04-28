import { execute, ExecPluginConfig, registerPlugin } from './_utils';

declare module './_utils' {
  export interface ExecPluginConfig {
    ghTypeDoc?: boolean;
  }
}

export const PLUGIN_NAME: keyof ExecPluginConfig = 'ghTypeDoc';
const OPTS = ' --inputFiles ./cjs/index-public.d.ts --mode file --includeDeclarations --excludeExternals --excludeNotExported --excludePrivate --excludeProtected --stripInternal';

registerPlugin(PLUGIN_NAME, analyzed => {
  const typeDoc = analyzed.binaryPath('lernaRoot', 'typedoc');
  const outPath = analyzed.pathJoin('lernaRoot', '.gh-pages-build', analyzed.name.name, 'api-docs');
  const cmd = `${typeDoc} --out ${outPath} ${OPTS}`;
  console.log(`Execute Plugin: ${cmd}`);
  execute(cmd);
});
