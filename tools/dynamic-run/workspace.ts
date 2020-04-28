import * as FS from 'fs';
import * as Path from 'path';

const IGNORE_FOLDERS = /^node_modules$|^\..+$/;

export function tryGetWorkspaceFromConfig(workspace?: string) {
  const pkgJsonPath = Path.join(process.cwd(), 'package.json');
  const hasPackageJson = FS.existsSync(pkgJsonPath);
  if (hasPackageJson) {
    const packages: string[] = JSON.parse(FS.readFileSync(pkgJsonPath, 'utf-8')).workspaces || [];
    for (const p of packages) {
      const parts = p.split(Path.sep);
      while (parts.length > 0) {
        if (FS.existsSync(Path.join(process.cwd(), parts.join(Path.sep)))) {
          return parts.join(Path.sep);
        }
        parts.pop();
      }
    }
  }
}

export function getAllAvailableProjects(root: string, forceChildSearch = false) {
  const results: Array<{ pkgJson: any, scripts: string[], path: string }> = [];
  const pkgJsonPath = Path.join(root, 'package.json');

  if (FS.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(FS.readFileSync(pkgJsonPath, 'utf-8'));
    const scripts: string[] = pkgJson.scripts ? Object.keys(pkgJson.scripts) : [];
    if (scripts.length > 0) {
      results.push({ pkgJson, scripts, path: pkgJsonPath });
    } else {
      return results;
    }
  } else if (!forceChildSearch) {
    return results;
  }

  for (const p of FS.readdirSync(root)) {
    if (!IGNORE_FOLDERS.test(p)) {
      const childDirPath = Path.join(root, p);
      if (FS.statSync(childDirPath).isDirectory()) {
        results.push(...getAllAvailableProjects(childDirPath));
      }
    }
  }

  return results;
}
