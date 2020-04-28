import * as Path from 'path';
import { IConfigFile, Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { ExecPluginConfig, registerPlugin } from './_utils';

export type ExecPluginApiExtractorConfigInput = Omit<IConfigFile, 'projectFolder' | 'extends'>;

declare module './_utils' {
  export interface ExecPluginConfig {
    apiExtractor?: boolean | ExecPluginApiExtractorConfigInput;
  }
}

export const PLUGIN_NAME: keyof ExecPluginConfig = 'apiExtractor';
const API_EXTRACTOR_JSON = ExtractorConfig.loadFile(Path.join(__dirname, 'api-extractor-base.json'));
const TOKENIZED_PATH_PROPS = {
  apiReport: ['reportFolder', 'reportTempFolder'],
  docModel: [ 'apiJsonFilePath' ],
  dtsRollup: [
    'untrimmedFilePath',
    'betaTrimmedFilePath',
    'publicTrimmedFilePath',
  ],
  tsdocMetadata: [ 'tsdocMetadataFilePath' ],
};

function merge(userApiExtractorConfig: ExecPluginApiExtractorConfigInput): IConfigFile {
  return {
    ...API_EXTRACTOR_JSON,
    ...userApiExtractorConfig,
  };
}

function updateLernaFolderToken(config: IConfigFile, lernaRoot: string) {
  for (const key of Object.keys(TOKENIZED_PATH_PROPS)) {
    if (config[key]) {
      for (const k of TOKENIZED_PATH_PROPS[key]) {
        const value: string = config[key][k];
        if (value) {
          const index = value.indexOf('<lernaFolder>');
          if (index > -1) {
            config[key][k] = Path.join(lernaRoot, value.substr(index + 1 + '<lernaFolder>'.length));
          }
        }
      }
    }
  }
}

registerPlugin(PLUGIN_NAME, analyzed => {
  const value = analyzed.execPluginValue<'apiExtractor'>(PLUGIN_NAME);
  const userApiExtractorConfig = typeof value === 'boolean' ? {} as ExecPluginApiExtractorConfigInput : value;

  const configObject = merge(userApiExtractorConfig);
  configObject.projectFolder = analyzed.libRoot;
  updateLernaFolderToken(configObject, analyzed.lernaRoot);
  const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
    configObject,
    configObjectFullPath: analyzed.libRoot,
    packageJson: analyzed.pkgJson,
    packageJsonFullPath: Path.join(analyzed.libRoot, 'package.json'),
  });

  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });
  
  if (extractorResult.succeeded) {
    console.log(`API Extractor completed successfully`);
  } else {
    throw new Error(`API Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings`);
  }
});
