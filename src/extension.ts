import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { getLanguageConfig } from './languageConfig'
import { fetchLeetCodeQuestion } from './fetchQuestion'

interface LeetCodeExample {
  input: number[]
  output: number[]
}

interface BoilerplateCode {
  [key: string]: {
    extension: string
    getLangSlug: () => string
  }
}

const LANGUAGE_BOILERPLATES: BoilerplateCode = {
  cpp: {
    extension: 'cpp',
    getLangSlug: () => 'cpp',
  },
  python: {
    extension: 'py',
    getLangSlug: () => 'python',
  },
}

async function createSolutionFile(
  titleSlug: string,
  language: string,
  problemPath: string
): Promise<void> {
  try {
    const { extension, template } = getLanguageConfig(language)
    const solutionFile = path.join(problemPath, `solution.${extension}`)

    // Check if solution file already exists
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

export function activate(context: vscode.ExtensionContext) {
  console.log('LeetCode Helper is now active!')

  let fetchProblem = vscode.commands.registerCommand(
    'LH.fetchProblem',
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

function extractExamplesFromGraphQL(content: string): LeetCodeExample[] {
  const examples: LeetCodeExample[] = []

  // Clean up the content
  content = content
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()

  // Extract numbers function
  const extractNumbers = (str: string): number[] => {
    // Match all numbers (including negative and decimals)
    const matches = str.match(/-?\d+\.?\d*/g)
    return matches ? matches.map(Number) : []
  }

  // Array of regex patterns to try
  const regexPatterns = [
    // Pattern 1: Standard LeetCode format with <pre> tags
    /<pre>\s*(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)(?:\s*(?:<strong>)?Explanation:.*?)?<\/pre>/gi,

    // Pattern 2: Format with <strong> tags but no <pre>
    /<strong>Input:<\/strong>\s*(.*?)\s*<strong>Output:<\/strong>\s*(.*?)(?:\s*(?:<strong>)?Explanation:.*?)?(?=<strong>|$)/gi,

    // Pattern 3: Simple "Input:" and "Output:" format
    /Input:\s*(.*?)\s*Output:\s*(.*?)(?:\s*Explanation:.*?)?(?=Input:|$)/gi,

    // Pattern 4: Format with Example number
    /Example\s*\d+:\s*(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)(?:\s*(?:<strong>)?Explanation:.*?)?(?=Example|\s*$)/gi,

    // Pattern 5: Format with <p> tags
    /<p>\s*(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)(?:\s*(?:<strong>)?Explanation:.*?)?<\/p>/gi,
  ]

  for (const regex of regexPatterns) {
    let match
    while ((match = regex.exec(content)) !== null) {
      const inputStr = match[1]
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')

      const outputStr = match[2]
        .trim()
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')

      if (inputStr && outputStr) {
        const input = extractNumbers(inputStr)
        const output = extractNumbers(outputStr)

        if (input.length > 0 || output.length > 0) {
          examples.push({ input, output })
        }
      }
    }

    // If we found any examples with current pattern, stop trying other patterns
    if (examples.length > 0) {
      break
    }
  }

  if (examples.length === 0) {
    console.warn(
      'No numerical examples found using regex patterns. Content might have a different format.'
    )
  }

  return examples
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

async function saveTestCases(
  titleSlug: string,
  examples: LeetCodeExample[],
  testCasesPath: string
): Promise<void> {
  ensureDirectoryExists(testCasesPath)

  const writePromises = examples.map(async (example, index) => {
    const inputPath = path.join(testCasesPath, `input_${index + 1}.txt`)
    const outputPath = path.join(testCasesPath, `output_${index + 1}.txt`)

    // Convert arrays to space-separated numbers
    const inputString = example.input.join(' ')
    const outputString = example.output.join(' ')

    await fs.promises.writeFile(inputPath, inputString)
    await fs.promises.writeFile(outputPath, outputString)
  })

  await Promise.all(writePromises)
}

export function deactivate() {}
