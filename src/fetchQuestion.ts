import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

// Represents a LeetCode example test case Contains input and output arrays of numbers
export interface LeetCodeExample {
  input: number[] // Array of input numbers
  output: number[] // Array of expected output numbers
}

export async function fetchLeetCodeQuestion(titleSlug: string) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        content
        difficulty
        exampleTestcases
      }
    }
  `

  const variables = {
    titleSlug: titleSlug,
  }

  const response = await axios.post(
    'https://leetcode.com/graphql',
    {
      query,
      variables,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VSCode-LeetCode-Helper/1.0',
      },
    }
  )

  if (!response.data.data) {
    throw new Error('Failed to fetch problem data')
  }

  return response.data.data
}

export async function saveTestCases(
  titleSlug: string,
  examples: LeetCodeExample[],
  testCasesPath: string
): Promise<void> {
  // Delete the existing directory if it exists
  if (fs.existsSync(testCasesPath)) {
    fs.rmSync(testCasesPath, { recursive: true, force: true }) // Remove directory and its contents
  }

  // Create a new directory
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

export function extractExamplesFromGraphQL(content: string): LeetCodeExample[] {
  // Clean up content first
  content = content
    .replace(/\\n/g, '\n') // Convert newlines
    .replace(/\\t/g, ' ') // Convert tabs
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces
    .trim()

  // Extracts numbers from a string
  const extractNumbers = (str: string): number[] => {
    const matches = str.match(/-?\d+\.?\d*/g)
    return matches ? matches.map(Number) : []
  }

  const examples: LeetCodeExample[] = []

  // Single comprehensive regex pattern
  const regexPattern =
    /(?:Example\s*\d*:)?\s*(?:<(?:pre|p)>\s*)?(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)(?:\s*(?:<strong>)?Explanation:.*?)?(?:<\/(?:pre|p)>|\s*$)/gi

  let match
  while ((match = regexPattern.exec(content)) !== null) {
    // Clean up input string
    const inputStr = match[1]
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"') // Convert HTML entities
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

    // Clean up output string
    const outputStr = match[2]
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"') // Convert HTML entities
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

    // Extract and store valid test cases
    if (inputStr && outputStr) {
      const input = extractNumbers(inputStr)
      const output = extractNumbers(outputStr)

      if (input.length > 0 || output.length > 0) {
        examples.push({ input, output })
      }
    }
  }

  if (examples.length === 0) {
    console.warn(
      'No numerical examples found using regex pattern. Content might have a different format.'
    )
  }

  return examples
}

// Creates directory if it doesn't exist
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}
