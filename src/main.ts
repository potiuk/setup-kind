import * as core from '@actions/core';
import { KindConfig, getKindConfig, getKind } from './kind';
const fs = require('fs');

fs.appendFileSync('message.txt', 'data to append');
async function run() {
  try {
    let cfg: KindConfig = getKindConfig();
    let toolPath: string = await getKind(cfg.version);
    const pathFile: string = process.env[`GITHUB_PATH`] || '';
    if (pathFile == '') {
      core.setFailed("The GITHUB_PATH environment variable is not set!")
    } else {
      fs.appendFileSync(pathFile, toolPath + "\n");
      await cfg.createCluster();
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
