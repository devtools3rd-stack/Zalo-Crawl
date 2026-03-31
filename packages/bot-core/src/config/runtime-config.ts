import { join } from 'node:path';

export function createRuntimeConfig(workspaceRoot: string) {
  return {
    workspaceRoot,
    authDir: join(workspaceRoot, 'playwright', '.auth'),
    groupsFile: join(workspaceRoot, 'data', 'groups.json')
  };
}
