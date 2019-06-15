#!/usr/bin/env node

import { remove, pathExists } from 'fs-extra';
import globby from 'globby';
import ora from 'ora';
import chalk from 'chalk';

const spinner = ora();

const removePath = async (path: string) => {
  await remove(path);

  if (await pathExists(path)) {
    throw new Error(`Could not remove ${path}`);
  }
};

const handleError = (err: Error) => {
  spinner.fail(chalk.redBright(err.message));
  process.exit(1);
};

(async () => {
  process.on('uncaughtException', handleError);
  process.on('unhandledRejection', handleError);

  const paths = await globby(['**/node_modules', '!**/node_modules/**/node_modules'], { expandDirectories: false, onlyDirectories: true });

  try {
    spinner.start(`Starting to cleanse ${paths.length} entries`);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];

      const progressText = `${i + 1}/${paths.length}`;
      spinner.text = `(${chalk.greenBright(progressText)}) Cleansing ${chalk.gray(path)}`;
      spinner.render();

      await removePath(path);
    }

    const entryText = paths.length !== 1 ? 'entries' : 'entry';
    spinner.succeed(`Successfully cleansed ${paths.length} ${entryText}!`);
  } catch (err) {
    handleError(err);
  }
})();
