import path from 'path';
import fs from 'fs-extra';

/**
 * @param {object} options
 * @param {string} options.from
 * @param {string} options.to
 * @param {RegExp=} options.pattern
 */
export async function orderedCopyFiles({ from, to, pattern = /(\d+)-(.*)/i }) {
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await orderedCopyFiles({
        from: fromPath,
        to: toPath,
        pattern,
      });
    } else {
      if (fs.existsSync(to)) {
        const matches = entry.name.match(pattern);
        if (matches?.length) {
          const toEntries = await fs.readdir(to);
          const found = toEntries.find(toEntry => toEntry.endsWith(matches[2]));
          if (found) {
            await fs.unlink(path.join(to, found));
          }
        }
      }
      await fs.copy(fromPath, toPath);
    }
  }
}
