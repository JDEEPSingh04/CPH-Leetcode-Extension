// Import necessary modules from VS Code API and Node.js
import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { exec } from 'child_process'
import { promisify } from 'util'

// Import helper functions and constants from other files
import { getLanguageConfig, getLanguageFromExtension } from './languageConfig'

// Convert exec to promise-based function
const execAsync = promisify(exec)

// To get the file path wrapped in quotes if needed, otherwise returns the original path
function wrapPath(filePath: string): string {
  return filePath.includes(' ') ? `"${filePath}"` : filePath
}

export async function createSolutionFile(
  titleSlug: string,
  language: string,
  problemPath: string
): Promise<void> {
  try {
    // Get language-specific configuration
    const { extension, template } = getLanguageConfig(language)
    const solutionFile = path.join(problemPath, `solution.${extension}`)

    // Check if solution file already exists to prevent overwriting
    if (
      await fs.promises
        .access(solutionFile)
        .then(() => true)
        .catch(() => false)
    ) {
      throw new Error(`Solution file already exists: ${solutionFile}`)
    }

    // Create problem directory if it doesn't exist
    await fs.promises.mkdir(problemPath, { recursive: true })

    // Write the solution file with the template
    await fs.promises.writeFile(solutionFile, template, 'utf8')

    console.log(`Created solution file: ${solutionFile}`)
  } catch (error) {
    console.error('There was an error creating solution file')
    throw error
  }
}

interface TestResult {
  testCase: number // Test case number
  passed: boolean // Whether the test passed
  expected: string // Expected output from test case
  actual: string // Actual output from solution
}

async function compareTestCases(problemPath: string): Promise<TestResult[]> {
  const results: TestResult[] = []
  const testCasesPath = path.join(problemPath, 'test_cases')
  const myOutputsPath = path.join(problemPath, 'myOutputs')

  // Get all output files and sort them numerically
  const outputFiles = fs
    .readdirSync(testCasesPath)
    .filter((file) => file.startsWith('output_'))
    .sort()

  for (const outputFile of outputFiles) {
    // Extract test case number from filename
    const testNumber = outputFile.match(/output_(\d+)\.txt/)?.[1]
    if (!testNumber) {
      continue
    }

    // Read expected output
    const expectedOutput = fs
      .readFileSync(path.join(testCasesPath, outputFile), 'utf8')
      .trim()

    // Read actual output
    const actualOutputPath = path.join(
      myOutputsPath,
      `Myoutput_${testNumber}.txt`
    )
    let actualOutput = ''
    try {
      actualOutput = fs.readFileSync(actualOutputPath, 'utf8').trim()
    } catch (error) {
      console.error(
        `Error reading actual output for test case ${testNumber}:`,
        error
      )
    }

    // Store comparison results
    results.push({
      testCase: parseInt(testNumber),
      passed: expectedOutput === actualOutput,
      expected: expectedOutput,
      actual: actualOutput,
    })
  }

  return results
}

async function compileAndRun(
  problemPath: string,
  language: string
): Promise<void> {
  const config = getLanguageConfig(language)
  const solutionFile = path.join(problemPath, `solution.${config.extension}`)
  const wrappedSolutionFile = wrapPath(solutionFile)

  // For C++, we need to handle the output file path specially
  if (language === 'cpp') {
    const outputFile = `${solutionFile}.out`
    const wrappedOutputFile = wrapPath(outputFile)

    if (config.compile) {
      try {
        const compileCommand = `g++ -std=c++17 ${wrappedSolutionFile} -o ${wrappedOutputFile}`
        await execAsync(compileCommand)
      } catch (error) {
        throw new Error(`Compilation failed: ${error}`)
      }
    }

    try {
      await execAsync(wrappedOutputFile, {
        cwd: problemPath,
      })
    } catch (error) {
      throw new Error(`Execution failed: ${error}`)
    }
  } else {
    if (config.compile && config.compileCommand) {
      try {
        const compileCommand = config.compileCommand(wrappedSolutionFile)
        await execAsync(compileCommand)
      } catch (error) {
        throw new Error(`Compilation failed: ${error}`)
      }
    }

    try {
      const runCommand = config.runCommand(wrappedSolutionFile)
      await execAsync(runCommand, {
        cwd: problemPath,
      })
    } catch (error) {
      throw new Error(`Execution failed: ${error}`)
    }
  }
}

// Main function to run all test cases for the current problem
export async function runAllTestCases(context: vscode.ExtensionContext) {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) {
      throw new Error('No workspace folder open')
    }

    const currentFile = vscode.window.activeTextEditor?.document.uri.fsPath
    if (!currentFile) {
      throw new Error('No file is currently open')
    }

    const problemPath = path.dirname(currentFile)
    const solutionFile = path.basename(currentFile)
    const fileExtension = solutionFile.split('.').pop() || ''

    // Get the proper language from the file extension
    const language = getLanguageFromExtension(fileExtension)

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Running test cases...',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: 'Compiling and running solution...' })
        await compileAndRun(problemPath, language)

        progress.report({ message: 'Comparing results...' })
        const results = await compareTestCases(problemPath)

        const totalTests = results.length
        const passedTests = results.filter((r) => r.passed).length

        const outputChannel = vscode.window.createOutputChannel(
          'LeetCode Test Results'
        )
        outputChannel.clear()

        outputChannel.appendLine(`Test Results Summary:`)
        outputChannel.appendLine(`Passed: ${passedTests}/${totalTests}\n`)

        results.forEach((result) => {
          outputChannel.appendLine(
            `Test Case ${result.testCase}: ${
              result.passed ? 'PASSED' : 'FAILED'
            }`
          )
          if (!result.passed) {
            outputChannel.appendLine(`Expected: ${result.expected}`)
            outputChannel.appendLine(`Actual: ${result.actual}`)
          }
          outputChannel.appendLine('')
        })

        outputChannel.show()

        const message = `${passedTests}/${totalTests} test cases passed`
        if (passedTests === totalTests) {
          vscode.window.showInformationMessage(
            `✅ All test cases passed! ${message}`
          )
        } else {
          vscode.window.showWarningMessage(
            `❌ Some test cases failed. ${message}`
          )
        }
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `Error running test cases: ${error.message}`
      )
    }
  }
}
