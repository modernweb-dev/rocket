import path from 'path';
import chalk from 'chalk';

/** @typedef {import('../types/main').Error} Error */

/**
 * @param {Error[]} errors
 * @param {*} relativeFrom
 */
export function formatErrors(errors, relativeFrom = process.cwd()) {
  let output = [];
  let number = 0;
  for (const error of errors) {
    number += 1;
    const filePath = path.relative(relativeFrom, error.filePath);
    if (error.onlyAnchorMissing === true) {
      output.push(
        `  ${number}. missing ${chalk.red.bold(
          `id="${error.usage[0].anchor}"`,
        )} in ${chalk.cyanBright(filePath)}`,
      );
    } else {
      const firstAttribute = error.usage[0].attribute;
      const title =
        firstAttribute === 'src' || firstAttribute === 'srcset' ? 'file' : 'reference target';

      output.push(`  ${number}. missing ${title} ${chalk.red.bold(filePath)}`);
    }
    const usageLength = error.usage.length;

    for (let i = 0; i < 3 && i < usageLength; i += 1) {
      const usage = error.usage[i];
      const usagePath = path.relative(relativeFrom, usage.file);
      const clickAbleLink = chalk.cyanBright(`${usagePath}:${usage.line + 1}:${usage.character}`);
      const attributeStart = chalk.gray(`${usage.attribute}="`);
      const attributeEnd = chalk.gray('"');
      output.push(`    from ${clickAbleLink} via ${attributeStart}${usage.value}${attributeEnd}`);
    }
    if (usageLength > 3) {
      const more = chalk.red((usageLength - 3).toString());
      output.push(`    ... ${more} more references to this target`);
    }
    output.push('');
  }
  return output.join('\n');
}
