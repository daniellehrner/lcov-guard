#!/usr/bin/env node

const fs = require('fs')
const util = require('util')

const lstat = util.promisify(fs.lstat)

const commander = require('commander')
const program = new commander.Command()

const { checkCodeCoverage } = require('./index')
const { description } = require('../package')

function parseAndCheckFloat (value) {
  const floatValue = parseFloat(value)

  if (isNaN(floatValue)) {
    throw new Error(`Error while checking coverage minimums: ${value} is not a valid number`)
  }

  return floatValue
}

function exitWithError (errorMessage) {
  console.error(errorMessage)
  process.exit(1)
}

async function lcovCoverageGuard (processArgv) {
  program
    .name('lcov-coverage-guard')
    .usage('-p file')
    .description(description)
    .option('-p, --path <path>', 'Path to LCOV formatted file')
    .option('-l, --lines <number>', 'Minimum line coverage in percent', parseAndCheckFloat, 0)
    .option('-f, --functions <number>', 'Minimum function coverage in percent', parseAndCheckFloat, 0)
    .option('-b, --branches <number>', 'Minimum branch coverage in percent', parseAndCheckFloat, 0)

  program.parse(processArgv)

  let stat

  try {
    stat = await lstat(program.path)
  } catch (error) {
    exitWithError(`Error while checking file ${program.path}: ${error.message}`)
  }

  if (!stat.isFile()) {
    exitWithError(`Error: ${program.path} is not a valid file`)
  }

  await checkCodeCoverage(
    program.path,
    program.lines,
    program.functions,
    program.branches
  )
}

lcovCoverageGuard(process.argv)
  .then(() => {
    console.info('Code coverage check successful')
    process.exit()
  })
  .catch((error) => {
    exitWithError(error.message)
  })

module.exports = {
  lcovCoverageGuard
}
