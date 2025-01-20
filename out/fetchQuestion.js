"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLeetCodeQuestion = fetchLeetCodeQuestion;
const axios_1 = __importDefault(require("axios"));
async function fetchLeetCodeQuestion(titleSlug) {
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
  `;
    const variables = {
        titleSlug: titleSlug,
    };
    const response = await axios_1.default.post('https://leetcode.com/graphql', {
        query,
        variables,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'VSCode-LeetCode-Helper/1.0',
        },
    });
    if (!response.data.data) {
        throw new Error('Failed to fetch problem data');
    }
    return response.data.data;
}
//# sourceMappingURL=fetchQuestion.js.map