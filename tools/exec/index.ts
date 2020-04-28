import './is-lib';
import './api-extractor';
import './gh-typedoc';
import './gh-docusaurus';
import { pluginExecuter, hasPlugin } from './_utils';

const index = process.argv.indexOf('--plugins');
const rawKeys = index === -1 ? '' : (process.argv[index + 1] || '');
const keys = rawKeys.split(',').map( k => k.trim() ).filter( k => !!k );

if (keys.length === 0) {
  throw new Error('Invalid execPluginConfig --plugins parameter, no plugins found. Please provide one or more plugin keys [comma (,) delimited].');
}

const executer = pluginExecuter();
for (const k of keys) {
  if (!hasPlugin(k)) {
    throw new Error(`Invalid execPluginConfig --plugins parameter, unknown plugin ${k}.`);
  } else {
    if (executer(k) === false) {
      break;
    }
  }
}
