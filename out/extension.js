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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
const LANGUAGE_BOILERPLATES = {
    'C++': {
        extension: 'cpp',
        getLangSlug: () => 'cpp',
    },
};
async function fetchCodeSnippet(titleSlug, lang) {
    const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        codeSnippets {
          lang
          langSlug
          code
        }
      }
    }
  `;
    const variables = {
        titleSlug: titleSlug,
    };
    try {
        const response = await axios_1.default.post('https://leetcode.com/graphql', {
            query,
            variables,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'VSCode-LeetCode-Helper/1.0',
            },
        });
        if (!response.data.data?.question?.codeSnippets) {
            throw new Error('Failed to fetch code snippets from LeetCode');
        }
        const snippet = response.data.data.question.codeSnippets.find((s) => s.langSlug === lang);
        if (!snippet) {
            throw new Error(`No code snippet found for language: ${lang}`);
        }
        return snippet.code;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            throw new Error(`LeetCode API error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
        }
        throw error;
    }
}
async function createSolutionFile(titleSlug, language, problemPath) {
    const { extension, getLangSlug } = LANGUAGE_BOILERPLATES[language];
    const solutionFile = path.join(problemPath, `solution.${extension}`);
    try {
        const codeSnippet = await fetchCodeSnippet(titleSlug, getLangSlug());
        await fs.promises.writeFile(solutionFile, codeSnippet);
    }
    catch (error) {
        console.error('Failed to fetch code snippet:', error);
        throw error;
    }
}
function activate(context) {
    console.log('LeetCode Helper is now active!');
    let fetchProblem = vscode.commands.registerCommand('LH.fetchProblem', async () => {
        try {
            const titleSlug = await vscode.window.showInputBox({
                prompt: 'Enter the LeetCode problem slug',
            });
            if (!titleSlug) {
                return;
            }
            // Language selection
            const selectedLanguage = await vscode.window.showQuickPick(Object.keys(LANGUAGE_BOILERPLATES), {
                placeHolder: 'Select programming language',
            });
            if (!selectedLanguage) {
                return;
            }
            vscode.window.showInformationMessage(`Fetching problem: ${titleSlug}`);
            const data = await fetchLeetCodeQuestion(titleSlug);
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder open');
            }
            // Create problem directory
            const problemPath = path.join(workspaceFolders[0].uri.fsPath, titleSlug);
            ensureDirectoryExists(problemPath);
            // Save test cases
            const testCasesPath = path.join(problemPath, 'test_cases');
            ensureDirectoryExists(testCasesPath);
            const examples = extractExamplesFromGraphQL(data.question.content);
            await saveTestCases(titleSlug, examples, testCasesPath);
            // Create solution file with boilerplate code from LeetCode
            await createSolutionFile(titleSlug, selectedLanguage, problemPath);
            vscode.window.showInformationMessage(`Problem setup completed successfully! Check the '${titleSlug}' directory.`);
            // Open the solution file
            const solutionFile = path.join(problemPath, `solution.${LANGUAGE_BOILERPLATES[selectedLanguage].extension}`);
            const document = await vscode.workspace.openTextDocument(solutionFile);
            await vscode.window.showTextDocument(document);
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        }
    });
    context.subscriptions.push(fetchProblem);
}
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
function extractExamplesFromGraphQL(content) {
    const examples = [];
    // First, clean up the content by normalizing line endings and spaces
    content = content
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim();
    // Array of regex patterns to try, from most specific to most general
    const regexPatterns = [
        // Pattern 1: Standard LeetCode format with <pre> tags
        /<pre>\s*(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)\s*<\/pre>/gi,
        // Pattern 2: Format with <strong> tags but no <pre>
        /<strong>Input:<\/strong>\s*(.*?)\s*<strong>Output:<\/strong>\s*(.*?)(?=<strong>|$)/gi,
        // Pattern 3: Simple "Input:" and "Output:" format
        /Input:\s*(.*?)\s*Output:\s*(.*?)(?=Input:|$)/gi,
        // Pattern 4: Format with Example number
        /Example\s*\d+:\s*(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)(?=Example|\s*$)/gi,
        // Pattern 5: Format with <p> tags
        /<p>\s*(?:<strong>)?Input:(?:<\/strong>)?\s*(.*?)\s*(?:<strong>)?Output:(?:<\/strong>)?\s*(.*?)\s*<\/p>/gi,
    ];
    for (const regex of regexPatterns) {
        let match;
        while ((match = regex.exec(content)) !== null) {
            const input = match[1]
                .trim()
                .replace(/<[^>]*>/g, '') // Remove any HTML tags
                .replace(/&quot;/g, '"') // Replace HTML entities
                .replace(/&apos;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
            const output = match[2]
                .trim()
                .replace(/<[^>]*>/g, '')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
            if (input && output) {
                // Only add if both input and output are non-empty
                examples.push({ input, output });
            }
        }
        // If we found any examples with current pattern, stop trying other patterns
        if (examples.length > 0) {
            break;
        }
    }
    // If no examples found using regex, try to get from exampleTestcases
    if (examples.length === 0) {
        console.warn('No examples found using regex patterns. Content might have a different format.');
    }
    return examples;
}
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
async function saveTestCases(titleSlug, examples, testCasesPath) {
    const problemPath = path.join(testCasesPath, titleSlug);
    ensureDirectoryExists(problemPath);
    const writePromises = examples.map(async (example, index) => {
        const inputPath = path.join(problemPath, `input_${index + 1}.txt`);
        const outputPath = path.join(problemPath, `output_${index + 1}.txt`);
        await fs.promises.writeFile(inputPath, example.input);
        await fs.promises.writeFile(outputPath, example.output);
    });
    await Promise.all(writePromises);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map