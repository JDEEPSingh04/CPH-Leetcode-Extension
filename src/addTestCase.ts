// Import necessary modules from VS Code API and Node.js
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

export async function addTestCase(context: vscode.ExtensionContext) {
  try {
    // Get current file path
    const currentFile = vscode.window.activeTextEditor?.document.uri.fsPath
    if (!currentFile) {
      throw new Error('No file is currently open')
    }

    // Check if it's a solution file
    if (!currentFile.match(/solution\.(cpp|py|java|js)$/)) {
      throw new Error('This command can only be used in solution files')
    }

    // Get problem directory
    const problemPath = path.dirname(currentFile)
    const testCasesPath = path.join(problemPath, 'test_cases')

    // Validate test cases directory exists
    if (!fs.existsSync(testCasesPath)) {
      throw new Error('Test cases directory not found')
    }

    // Get user input
    const input = await vscode.window.showInputBox({
      prompt: 'Enter input numbers (space-separated)',
      placeHolder: 'e.g., 1 2 3 4',
    })

    if (!input) {
      throw new Error('No input provided')
    }

    const output = await vscode.window.showInputBox({
      prompt: 'Enter expected output numbers (space-separated)',
      placeHolder: 'e.g., 3 4',
    })

    if (!output) {
      throw new Error('No output provided')
    }

    // Get next test case number
    const existingFiles = fs
      .readdirSync(testCasesPath)
      .filter((f) => f.startsWith('input_'))
      .map((f) => parseInt(f.match(/input_(\d+)\.txt/)?.[1] || '0'))
    const nextNumber = Math.max(0, ...existingFiles) + 1

    // Save test case files
    const inputPath = path.join(testCasesPath, `input_${nextNumber}.txt`)
    const outputPath = path.join(testCasesPath, `output_${nextNumber}.txt`)

    fs.writeFileSync(inputPath, input)
    fs.writeFileSync(outputPath, output)

    vscode.window.showInformationMessage(
      `Test case ${nextNumber} added successfully!`
    )
  } 
  catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error adding test case: ${error.message}`)
    }
  }
}
