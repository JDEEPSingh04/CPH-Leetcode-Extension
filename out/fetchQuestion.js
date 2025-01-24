"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSlugFromUrl = extractSlugFromUrl;
exports.fetchLeetCodeQuestion = fetchLeetCodeQuestion;
exports.saveTestCases = saveTestCases;
exports.extractExamplesFromGraphQL = extractExamplesFromGraphQL;
exports.ensureDirectoryExists = ensureDirectoryExists;
// Import necessary modules from VS Code API and Node.js
const axios_1 = __importDefault(require("axios")); // Axios is used to make HTTP requests
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Get the problem slug from the URL
function extractSlugFromUrl(url) {
    const match = url.match(/leetcode\.com\/problems\/([^\/]+)/);
    if (!match) {
        throw new Error('Invalid LeetCode problem URL');
    }
    return match[1];
}
async function fetchLeetCodeQuestion(url) {
    const titleSlug = extractSlugFromUrl(url);
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
async function saveTestCases(titleSlug, examples, testCasesPath) {
    // Delete the existing directory if it exists
    if (fs.existsSync(testCasesPath)) {
        fs.rmSync(testCasesPath, { recursive: true, force: true }); // Remove directory and its contents
    }
    // Create a new directory
    ensureDirectoryExists(testCasesPath);
    const writePromises = examples.map(async (example, index) => {
        const inputPath = path.join(testCasesPath, `input_${index + 1}.txt`);
        const outputPath = path.join(testCasesPath, `output_${index + 1}.txt`);
        // Convert arrays to space-separated numbers
        const inputString = example.input.join(' ');
        const outputString = example.output.join(' ');
        await fs.promises.writeFile(inputPath, inputString);
        await fs.promises.writeFile(outputPath, outputString);
    });
    await Promise.all(writePromises);
}
function extractExamplesFromGraphQL(content) {
    // Clean up content first
    content = content
        .replace(/\\n/g, '\n') // Convert newlines
        .replace(/\\t/g, ' ') // Convert tabs
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces
        .trim();
    // Extracts numbers from a string
    const extractNumbers = (str) => {
        const matches = str.match(/-?\d+\.?\d*/g);
        return matches ? matches.map(Number) : [];
    };
    const examples = [];
    // Single comprehensive regex pattern
    const regexPattern = /(?:Example\s*\d*:)?\s*(?:<(?:pre|p)>\s*)?(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)(?:\s*(?:<strong>)?Explanation:.*?)?(?:<\/(?:pre|p)>|\s*$)/gi;
    let match;
    while ((match = regexPattern.exec(content)) !== null) {
        // Clean up input string
        const inputStr = match[1]
            .trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&quot;/g, '"') // Convert HTML entities
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        // Clean up output string
        const outputStr = match[2]
            .trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&quot;/g, '"') // Convert HTML entities
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        // Extract and store valid test cases
        if (inputStr && outputStr) {
            const input = extractNumbers(inputStr);
            const output = extractNumbers(outputStr);
            if (input.length > 0 || output.length > 0) {
                examples.push({ input, output });
            }
        }
    }
    if (examples.length === 0) {
        console.warn('No numerical examples found using regex pattern. Content might have a different format.');
    }
    return examples;
}
// Creates directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
//# sourceMappingURL=fetchQuestion.js.map