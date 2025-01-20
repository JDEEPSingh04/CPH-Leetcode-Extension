import axios from 'axios'

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
