// Import necessary modules from VS Code API and Node.js
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

// Import helper functions and constants from other files
import {
  fetchLeetCodeQuestion,
  saveTestCases,
  ensureDirectoryExists,
  extractExamplesFromGraphQL,
  extractSlugFromUrl,
} from './fetchQuestion'
import { LANGUAGE_BOILERPLATES } from './languageConfig'
import { createSolutionFile } from './runTestCases'
import { runAllTestCases } from './runTestCases'
import { addTestCase } from './addTestCase'
import { SidebarProvider } from './SidebarProvider'

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('LeetCode Helper is now active!')

  // Register the command to fetch a LeetCode problem
  let fetchProblem = vscode.commands.registerCommand(
    'CPH.fetchProblem',
    async () => {
      try {
        // Prompt the user to enter the LeetCode problem slug
        const url = await vscode.window.showInputBox({
          prompt: 'Enter the URL of the LeetCode problem',
        })

        if (!url) {
          throw new Error('No URL provided')
        }

        // Prompt the user to select a programming language
        const selectedLanguage = await vscode.window.showQuickPick(
          Object.keys(LANGUAGE_BOILERPLATES),
          {
            placeHolder: 'Select programming language',
          }
        )

        if (!selectedLanguage) {
          throw new Error('No language selected')
        }

        vscode.window.showInformationMessage(`Fetching problem data...`)

        // Fetch the problem data from LeetCode
        const data = await fetchLeetCodeQuestion(url)

        if (!data || !data.question || !data.question.content) {
          throw new Error(
            `Failed to fetch problem data. Please check if the problem url is correct.`
          )
        }

        const workspaceFolders = vscode.workspace.workspaceFolders
        if (!workspaceFolders) {
          throw new Error('No workspace folder open')
        }

        // Extract the problem slug from the URL
        const titleSlug = extractSlugFromUrl(url)

        // Create problem directory
        const problemPath = path.join(workspaceFolders[0].uri.fsPath, titleSlug)
        // Check if the problem directory already exists

        const directoryExists = fs.existsSync(problemPath)

        if (directoryExists) {
          const overwrite = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: `The directory '${titleSlug}' already exists. Do you want to overwrite it?`,
          })

          if (overwrite === 'No') {
            vscode.window.showInformationMessage(
              'Skipping fetch of the problem.'
            )
            return // Skip fetching if the user chooses not to overwrite
          }

          // If user chooses to overwrite, remove the existing directory
          fs.rmSync(problemPath, { recursive: true, force: true })
        }
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

  // Register the command to run all test cases
  let runTestCases = vscode.commands.registerCommand(
    'CPH.runTestCases',
    async () => {
      await runAllTestCases(context)
    }
  )

  // Register the command to add a new test case
  let addTestCaseCommand = vscode.commands.registerCommand(
    'CPH.addTestCase',
    async () => {
      await addTestCase(context)
    }
  )

  // Create instance of SidebarProvider for managing webview UI extensionUri is used to load resources and manage webview content
  const sidebarProvider = new SidebarProvider(context.extensionUri)

  // Register the webview provider with VS Code
  // This allows the sidebar to be shown in the activity bar
  // Add to subscriptions for proper cleanup when extension deactivates
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType, // Unique identifier for the view
      sidebarProvider // Instance that provides the webview content
    )
  )

  // Add the commands to the extension's subscriptions
  context.subscriptions.push(fetchProblem)
}

// This method is called when the extension is deactivated
export function deactivate() {}
