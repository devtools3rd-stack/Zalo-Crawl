import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { GroupConfigSchema, type GroupConfig } from '@zaloridebot/shared';

export class FileGroupRegistry {
  constructor(private readonly filePath: string) {}

  async load(): Promise<GroupConfig[]> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return GroupConfigSchema.array().parse(JSON.parse(raw));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }

  async save(groups: GroupConfig[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(groups, null, 2));
  }
}
