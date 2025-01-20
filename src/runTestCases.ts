import * as fs from 'fs'
import * as path from 'path'
import { getLanguageConfig } from './languageConfig'

export interface BoilerplateCode {
  [key: string]: {
    extension: string
    getLangSlug: () => string
  }
}

export const LANGUAGE_BOILERPLATES: BoilerplateCode = {
  cpp: {
    extension: 'cpp',
    getLangSlug: () => 'cpp',
  },
  python: {
    extension: 'py',
    getLangSlug: () => 'python',
  },
}

export async function createSolutionFile(
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
