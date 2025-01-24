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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// Import necessary modules from VS Code API and Node.js
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Import helper functions and constants from other files
const fetchQuestion_1 = require("./fetchQuestion");
const languageConfig_1 = require("./languageConfig");
const runTestCases_1 = require("./runTestCases");
const runTestCases_2 = require("./runTestCases");
const addTestCase_1 = require("./addTestCase");
const SidebarProvider_1 = require("./SidebarProvider");
// This method is called when the extension is activated
function activate(context) {
    console.log('LeetCode Helper is now active!');
    // Register the command to fetch a LeetCode problem
    let fetchProblem = vscode.commands.registerCommand('CPH.fetchProblem', async () => {
        try {
            // Prompt the user to enter the LeetCode problem slug
            const url = await vscode.window.showInputBox({
                prompt: 'Enter the URL of the LeetCode problem',
            });
            if (!url) {
                throw new Error('No URL provided');
            }
            // Prompt the user to select a programming language
            const selectedLanguage = await vscode.window.showQuickPick(Object.keys(languageConfig_1.LANGUAGE_BOILERPLATES), {
                placeHolder: 'Select programming language',
            });
            if (!selectedLanguage) {
                throw new Error('No language selected');
            }
            vscode.window.showInformationMessage(`Fetching problem data...`);
            // Fetch the problem data from LeetCode
            const data = await (0, fetchQuestion_1.fetchLeetCodeQuestion)(url);
            if (!data || !data.question || !data.question.content) {
                throw new Error(`Failed to fetch problem data. Please check if the problem url is correct.`);
            }
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder open');
            }
            // Extract the problem slug from the URL
            const titleSlug = (0, fetchQuestion_1.extractSlugFromUrl)(url);
            // Create problem directory
            const problemPath = path.join(workspaceFolders[0].uri.fsPath, titleSlug);
            // Check if the problem directory already exists
            const directoryExists = fs.existsSync(problemPath);
            if (directoryExists) {
                const overwrite = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `The directory '${titleSlug}' already exists. Do you want to overwrite it?`,
                });
                if (overwrite === 'No') {
                    vscode.window.showInformationMessage('Skipping fetch of the problem.');
                    return; // Skip fetching if the user chooses not to overwrite
                }
                // If user chooses to overwrite, remove the existing directory
                fs.rmSync(problemPath, { recursive: true, force: true });
            }
            (0, fetchQuestion_1.ensureDirectoryExists)(problemPath);
            // Save test cases
            const testCasesPath = path.join(problemPath, 'test_cases');
            (0, fetchQuestion_1.ensureDirectoryExists)(testCasesPath);
            const examples = (0, fetchQuestion_1.extractExamplesFromGraphQL)(data.question.content);
            await (0, fetchQuestion_1.saveTestCases)(titleSlug, examples, testCasesPath);
            // Create solution file with boilerplate code from LeetCode
            await (0, runTestCases_1.createSolutionFile)(titleSlug, selectedLanguage, problemPath);
            vscode.window.showInformationMessage(`Problem setup completed successfully! Check the '${titleSlug}' directory.`);
            // Open the solution file
            const solutionFile = path.join(problemPath, `solution.${languageConfig_1.LANGUAGE_BOILERPLATES[selectedLanguage].extension}`);
            const document = await vscode.workspace.openTextDocument(solutionFile);
            await vscode.window.showTextDocument(document);
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        }
    });
    // Register the command to run all test cases
    let runTestCases = vscode.commands.registerCommand('CPH.runTestCases', async () => {
        await (0, runTestCases_2.runAllTestCases)(context);
    });
    // Register the command to add a new test case
    let addTestCaseCommand = vscode.commands.registerCommand('CPH.addTestCase', async () => {
        await (0, addTestCase_1.addTestCase)(context);
    });
    // Create instance of SidebarProvider for managing webview UI extensionUri is used to load resources and manage webview content
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    // Register the webview provider with VS Code
    // This allows the sidebar to be shown in the activity bar
    // Add to subscriptions for proper cleanup when extension deactivates
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SidebarProvider_1.SidebarProvider.viewType, // Unique identifier for the view
    sidebarProvider // Instance that provides the webview content
    ));
    // Add the commands to the extension's subscriptions
    context.subscriptions.push(fetchProblem);
}
// This method is called when the extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map