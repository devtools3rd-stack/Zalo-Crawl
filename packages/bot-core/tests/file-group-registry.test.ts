import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileGroupRegistry } from '../src/registry/file-group-registry.js';

describe('file group registry', () => {
  it('saves pinned groups to disk', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zaloridebot-'));
    const filePath = join(dir, 'groups.json');
    const registry = new FileGroupRegistry(filePath);

    await registry.save([
      {
        id: 'group-1',
        zaloGroupKey: 'zalo-1',
        name: 'Nhom 1',
        isPinned: true,
        defaultReply: 'em nhan cuoc',
        keywordRules: ['cuoc xe'],
        patternRules: ['\\d{9,11}']
      }
    ]);

    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    expect(raw[0].name).toBe('Nhom 1');
  });

  it('returns an empty array when the file is missing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zaloridebot-'));
    const filePath = join(dir, 'groups.json');
    const registry = new FileGroupRegistry(filePath);

    await expect(registry.load()).resolves.toEqual([]);
  });

  it('validates loaded groups before returning them', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zaloridebot-'));
    const filePath = join(dir, 'groups.json');
    const registry = new FileGroupRegistry(filePath);

    writeFileSync(
      filePath,
      JSON.stringify([
        {
          id: 'group-1',
          name: 'Nhom 1'
        }
      ])
    );

    await expect(registry.load()).rejects.toThrow();
  });
});
