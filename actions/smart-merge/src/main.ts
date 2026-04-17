import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {access} from 'node:fs/promises'
import path from 'node:path'

// Smart merge is used to propagate upstream branch updates into
// the fork. To do that, a smart(er) driver is used, which loads resolution
// config and applies default merging strategies to different files/directories.
// Paths that are likely to change in both branches are left unresolved.

const MERGE_DRIVER_NAME = 'smart-merge'

function quoteShellArg(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

async function ensureFileExists(filePath: string): Promise<void> {
  await access(filePath)
}

async function gitConfig(key: string, value: string): Promise<void> {
  await exec.exec('git', ['config', '--local', key, value])
}

async function configureMergeDriver(mergeMappingFile: string): Promise<void> {
  const mappingFilePath = path.resolve(mergeMappingFile)
  await ensureFileExists(mappingFilePath)

  const driverScriptPath = path.resolve(
    __dirname,
    'merge-driver',
    'index.js'
  )

  const driverCommand = [
    'node',
    quoteShellArg(driverScriptPath),
    '--merge-mapping-file',
    quoteShellArg(mappingFilePath),
    '%O',
    '%A',
    '%B',
    '%P'
  ].join(' ')

  await gitConfig(`merge.${MERGE_DRIVER_NAME}.name`, 'Smart merge driver')
  await gitConfig(`merge.${MERGE_DRIVER_NAME}.driver`, driverCommand)
}

async function run(): Promise<void> {
  try {
    // Remote that contains master changes.
    const masterRemote = core.getInput('master-remote', {required: true})
    // Remote branch to pull (typically master).
    const masterBranch = core.getInput('master-branch', {required: true})

    // Changes take place in fork, so we specify only branch here.
    const forkBranch = core.getInput('fork-branch', {required: true})
    // Mapping with strategies.
    const mergeMappingFile = core.getInput('merge-mapping-file', {
      required: true
    })

    core.info(
      `Preparing smart merge from ${masterRemote}/${masterBranch} into ${forkBranch}`
    )

    await configureMergeDriver(mergeMappingFile)
    core.setOutput('merge-driver', MERGE_DRIVER_NAME)
    core.info(`Configured Git merge driver '${MERGE_DRIVER_NAME}'`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    core.setFailed(message)
  }
}

void run()
