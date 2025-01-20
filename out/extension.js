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
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fetchQuestion_1 = require("./fetchQuestion");
const runTestCases_1 = require("./runTestCases");
function activate(context) {
    console.log('LeetCode Helper is now active!');
    let fetchProblem = vscode.commands.registerCommand('CPH.fetchProblem', async () => {
        try {
            const titleSlug = await vscode.window.showInputBox({
                prompt: 'Enter the LeetCode problem slug',
            });
            if (!titleSlug) {
                throw new Error('No problem slug provided');
            }
            // Language selection
            const selectedLanguage = await vscode.window.showQuickPick(Object.keys(runTestCases_1.LANGUAGE_BOILERPLATES), {
                placeHolder: 'Select programming language',
            });
            if (!selectedLanguage) {
                throw new Error('No language selected');
            }
            vscode.window.showInformationMessage(`Fetching problem: ${titleSlug}`);
            const data = await (0, fetchQuestion_1.fetchLeetCodeQuestion)(titleSlug);
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder open');
            }
            // Create problem directory
            const problemPath = path.join(workspaceFolders[0].uri.fsPath, titleSlug);
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
            const solutionFile = path.join(problemPath, `solution.${runTestCases_1.LANGUAGE_BOILERPLATES[selectedLanguage].extension}`);
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
function deactivate() { }
//# sourceMappingURL=extension.js.map