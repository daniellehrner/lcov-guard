const parse = require('lcov-parse')
const util = require('util')

const lcovParse = util.promisify(parse)

const COVERAGE_TYPES = ['lines', 'functions', 'branches']

async function checkCodeCoverage (path, linesCoverage, functionsCoverage, branchesCoverage) {
  let files
  let errorMessage = ''

  const coverageMinimum = {
    lines: linesCoverage,
    functions: functionsCoverage,
    branches: branchesCoverage
  }

  try {
    files = await lcovParse(path)
  } catch (err) {
    throw new Error(`Error while parsing LCOV file ${path}: ${err}`)
  }

  files.forEach((file) => {
    COVERAGE_TYPES.forEach((coverageType) => {
      if (coverageMinimum[coverageType] === 0 || file[coverageType].found === 0) {
        return
      }

      const coverage = file[coverageType].hit / file[coverageType].found * 100

      if (coverage < coverageMinimum[coverageType]) {
        errorMessage += `${file.file}: ${coverageType} coverage is only ${coverage.toFixed(2)}%\n`
      }
    })
  })

  if (errorMessage.length > 0) {
    throw new Error(`Error: Not all files are above the code coverage:\n${errorMessage}`)
  }
}

module.exports = {
  checkCodeCoverage
}
