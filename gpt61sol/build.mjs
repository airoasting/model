import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const project = dirname(fileURLToPath(import.meta.url));
const output = join(project, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js']) {
  await copyFile(join(project, file), join(output, file));
}
await cp(join(project, 'assets'), join(output, 'assets'), { recursive: true });
console.log('SOL is ready in dist/');
