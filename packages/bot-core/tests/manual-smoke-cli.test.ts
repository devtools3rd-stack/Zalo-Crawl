import { describe, expect, it, vi } from 'vitest';

const runManualSmokeMock = vi.fn(async () => ({ url: 'https://chat.zalo.me/' }));

vi.mock('../src/runtime/manual-smoke.js', () => ({
  runManualSmoke: runManualSmokeMock
}));

describe('manual smoke cli', () => {
  it('invokes the smoke harness with the current working directory', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runManualSmokeCli } = await import('../src/runtime/manual-smoke-cli.js');

    await expect(runManualSmokeCli()).resolves.toEqual({ url: 'https://chat.zalo.me/' });
    expect(runManualSmokeMock).toHaveBeenCalledWith(process.cwd());
    expect(consoleLogSpy).toHaveBeenCalledWith('https://chat.zalo.me/');
  });
});
