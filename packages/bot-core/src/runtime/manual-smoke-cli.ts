import { pathToFileURL } from 'node:url';
import { runManualSmoke } from './manual-smoke.js';

export async function runManualSmokeCli() {
  const result = await runManualSmoke(process.cwd());
  console.log(result.url);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void runManualSmokeCli().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
