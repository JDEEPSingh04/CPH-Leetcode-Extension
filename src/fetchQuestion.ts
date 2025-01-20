import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

export interface LeetCodeExample {
  input: number[]
  output: number[]
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

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}