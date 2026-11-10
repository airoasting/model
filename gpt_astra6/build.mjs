import { cp, mkdir } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const output = new URL('./dist/', root);
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'style.css', 'app.js', 'assets']) {
  await cp(new URL(name, root), new URL(name, output), { recursive: true });
}
