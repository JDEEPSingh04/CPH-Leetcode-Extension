import * as vscode from 'vscode'
import * as path from 'path'
import {
  fetchLeetCodeQuestion,
  saveTestCases,
  ensureDirectoryExists,
  extractExamplesFromGraphQL,
} from './fetchQuestion'
import { LANGUAGE_BOILERPLATES } from './languageConfig'
import { createSolutionFile } from './runTestCases'

export function activate(context: vscode.ExtensionContext) {
  console.log('LeetCode Helper is now active!')

  let fetchProblem = vscode.commands.registerCommand(
    'CPH.fetchProblem',
    async () => {
      try {
        const titleSlug = await vscode.window.showInputBox({
          prompt: 'Enter the LeetCode problem slug',
        })

        if (!titleSlug) {
          throw new Error('No problem slug provided')
        }

        // Language selection
        const selectedLanguage = await vscode.window.showQuickPick(
          Object.keys(LANGUAGE_BOILERPLATES),
          {
            placeHolder: 'Select programming language',
          }
        )

        if (!selectedLanguage) {
          throw new Error('No language selected')
        }

        vscode.window.showInformationMessage(`Fetching problem: ${titleSlug}`)

        const data = await fetchLeetCodeQuestion(titleSlug)

        const workspaceFolders = vscode.workspace.workspaceFolders
        if (!workspaceFolders) {
          throw new Error('No workspace folder open')
        }

        // Create problem directory
        const problemPath = path.join(workspaceFolders[0].uri.fsPath, titleSlug)
        ensureDirectoryExists(problemPath)

        // Save test cases
        const testCasesPath = path.join(problemPath, 'test_cases')
        ensureDirectoryExists(testCasesPath)

        const examples = extractExamplesFromGraphQL(data.question.content)
        await saveTestCases(titleSlug, examples, testCasesPath)

        // Create solution file with boilerplate code from LeetCode
        await createSolutionFile(titleSlug, selectedLanguage, problemPath)

        vscode.window.showInformationMessage(
          `Problem setup completed successfully! Check the '${titleSlug}' directory.`
        )

        // Open the solution file
        const solutionFile = path.join(
          problemPath,
          `solution.${LANGUAGE_BOILERPLATES[selectedLanguage].extension}`
        )
        const document = await vscode.workspace.openTextDocument(solutionFile)
        await vscode.window.showTextDocument(document)
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(`Error: ${error.message}`)
        }
      }
    }
  )

  context.subscriptions.push(fetchProblem)
}

export function deactivate() {}
