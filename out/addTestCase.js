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
exports.addTestCase = addTestCase;
// Import necessary modules from VS Code API and Node.js
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function addTestCase(context) {
    try {
        // Get current file path
        const currentFile = vscode.window.activeTextEditor?.document.uri.fsPath;
        if (!currentFile) {
            throw new Error('No file is currently open');
        }
        // Check if it's a solution file
        if (!currentFile.match(/solution\.(cpp|py|java|js)$/)) {
            throw new Error('This command can only be used in solution files');
        }
        // Get problem directory
        const problemPath = path.dirname(currentFile);
        const testCasesPath = path.join(problemPath, 'test_cases');
        // Validate test cases directory exists
        if (!fs.existsSync(testCasesPath)) {
            throw new Error('Test cases directory not found');
        }
        // Get user input
        const input = await vscode.window.showInputBox({
            prompt: 'Enter input numbers (space-separated)',
            placeHolder: 'e.g., 1 2 3 4',
        });
        if (!input) {
            throw new Error('No input provided');
        }
        const output = await vscode.window.showInputBox({
            prompt: 'Enter expected output numbers (space-separated)',
            placeHolder: 'e.g., 3 4',
        });
        if (!output) {
            throw new Error('No output provided');
        }
        // Get next test case number
        const existingFiles = fs
            .readdirSync(testCasesPath)
            .filter((f) => f.startsWith('input_'))
            .map((f) => parseInt(f.match(/input_(\d+)\.txt/)?.[1] || '0'));
        const nextNumber = Math.max(0, ...existingFiles) + 1;
        // Save test case files
        const inputPath = path.join(testCasesPath, `input_${nextNumber}.txt`);
        const outputPath = path.join(testCasesPath, `output_${nextNumber}.txt`);
        fs.writeFileSync(inputPath, input);
        fs.writeFileSync(outputPath, output);
        vscode.window.showInformationMessage(`Test case ${nextNumber} added successfully!`);
    }
    catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error adding test case: ${error.message}`);
        }
    }
}
//# sourceMappingURL=addTestCase.js.map