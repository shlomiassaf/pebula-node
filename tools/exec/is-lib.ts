import * as Path from 'path';
import { execute, ExecPluginConfig, registerPlugin } from './_utils';

declare module './_utils' {
  export interface ExecPluginConfig {
    isLib?: boolean;
  }
}

const PLUGIN_NAME: keyof ExecPluginConfig = 'isLib';
    
registerPlugin(PLUGIN_NAME, analyzed => {
  execute('yarn build');
});
