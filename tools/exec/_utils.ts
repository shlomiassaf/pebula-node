import * as FS from 'fs';
import * as Path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';

export type ExecPlugin = (analyzedPackage: AnalyzedPackage) => boolean | void;

export interface ExecPluginConfig { }

export class AnalyzedPackage {

  static create(libRoot?: string) {
    const pkgJsonPath = Path.join(process.cwd(), 'package.json');
    const hasPackageJson = FS.existsSync(pkgJsonPath);
    if (hasPackageJson) {
      const pkgJson = JSON.parse(FS.readFileSync(pkgJsonPath, 'utf-8'));
      return new AnalyzedPackage(pkgJson, libRoot);
    }
  }

  readonly name: { scope?: string; name: string };
  readonly execPluginConfig: ExecPluginConfig;

  readonly libRoot: string;
  readonly lernaRoot: string;

  private constructor(public readonly pkgJson: any, libRoot?: string) {
    const nameSplit = pkgJson.name.split('/');
    const scope: string = nameSplit.length > 1 ? nameSplit[0] : '';
    const name: string = nameSplit.pop();
    this.name = { scope, name };
    this.execPluginConfig = (pkgJson.execPluginConfig || {}) as ExecPluginConfig;
    
    this.libRoot = libRoot || process.cwd();
    this.lernaRoot = this.findRoot();
  }

  isExecPluginDefined(pluginName: keyof ExecPluginConfig) {
    return !!this.execPluginConfig[pluginName]
  }

  execPluginValue<T extends keyof ExecPluginConfig>(pluginName: T): ExecPluginConfig[T] {
    return this.execPluginConfig[pluginName]
  }

  pathJoin(from: 'libRoot' | 'lernaRoot', ...segments: string[]) {
    return Path.join(from === 'libRoot' ? this.libRoot : this.lernaRoot, ...segments);
  }

  binaryPath(from: 'libRoot' | 'lernaRoot', binName: string) {
    return this.pathJoin(from, 'node_modules', '.bin', binName)
  }

  cloneParent(depth = 1) {
    let libRoot = this.libRoot;
    for (let i = 0; i < depth; i++) {
      libRoot = Path.dirname(libRoot);
    }
    return AnalyzedPackage.create(libRoot);
  }

  cloneChildren(...segments: string[]) {
    let libRoot = Path.join(this.libRoot, ...segments);
    return AnalyzedPackage.create(libRoot);
  }

  private findRoot() {
    if (process.env.LERNA_ROOT_PATH) {
      return process.env.LERNA_ROOT_PATH;
    }
    const rel = Path.relative(process.cwd(), __dirname);
    const relSplit = rel.split(Path.sep).filter( p => p === '.' || p === '..' );
    return Path.join(process.cwd(), ...relSplit);
  }
}

const PLUGINS  = new Map<keyof ExecPluginConfig, ExecPlugin>();

export function registerPlugin(key: keyof ExecPluginConfig, plugin: ExecPlugin) {
  PLUGINS.set(key, plugin);
}

export function hasPlugin(key: string): key is keyof ExecPluginConfig {
  return PLUGINS.has(key as any);
}

export function pluginExecuter() {
  const analyzed = AnalyzedPackage.create();
  return (key: keyof ExecPluginConfig): ReturnType<ExecPlugin> => {
    if (analyzed.isExecPluginDefined(key)) {
      console.log(`Exec Plugin: ${key}`);
      return PLUGINS.get(key)(analyzed);
    }
  }
}

export function execute(cmd: string, options?: ExecSyncOptions) {
  execSync(cmd, { ...(options || {}), stdio: 'inherit' } );
}
