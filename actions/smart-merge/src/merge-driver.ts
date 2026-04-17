import * as core from '@actions/core'

function parseArgs(argv: string[]): {
  mergeMappingFile: string
  baseFile: string
  currentFile: string
  otherFile: string
  pathName: string
} {
  if (argv.length < 6 || argv[0] !== '--merge-mapping-file') {
    throw new Error(
      'Expected arguments: --merge-mapping-file <file> %O %A %B %P'
    )
  }

  const [, mergeMappingFile, baseFile, currentFile, otherFile, pathName] = argv
  return {mergeMappingFile, baseFile, currentFile, otherFile, pathName}
}

async function run(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2))

    core.info(
      `Smart merge driver invoked for ${args.pathName} using mapping ${args.mergeMappingFile}`
    )

    throw new Error('Smart merge driver resolution is not implemented yet')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    core.error(message)
    process.exitCode = 1
  }
}

void run()
