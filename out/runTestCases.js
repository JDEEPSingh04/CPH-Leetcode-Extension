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
exports.createSolutionFile = createSolutionFile;
exports.runAllTestCases = runAllTestCases;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const languageConfig_1 = require("./languageConfig");
// Convert exec to promise-based function
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function createSolutionFile(titleSlug, language, problemPath) {
    try {
        // Get language-specific configuration
        const { extension, template } = (0, languageConfig_1.getLanguageConfig)(language);
        const solutionFile = path.join(problemPath, `solution.${extension}`);
        // Check if solution file already exists to prevent overwriting
        if (await fs.promises
            .access(solutionFile)
            .then(() => true)
            .catch(() => false)) {
            throw new Error(`Solution file already exists: ${solutionFile}`);
        }
        // Create problem directory if it doesn't exist
        await fs.promises.mkdir(problemPath, { recursive: true });
        // Write the solution file with the template
        await fs.promises.writeFile(solutionFile, template, 'utf8');
        console.log(`Created solution file: ${solutionFile}`);
    }
    catch (error) {
        console.error('There was an error creating solution file');
        throw error;
    }
}
async function compareTestCases(problemPath) {
    const results = [];
    const testCasesPath = path.join(problemPath, 'test_cases');
    const myOutputsPath = path.join(problemPath, 'myOutputs');
    // Get all output files and sort them numerically
    const outputFiles = fs
        .readdirSync(testCasesPath)
        .filter((file) => file.startsWith('output_'))
        .sort();
    for (const outputFile of outputFiles) {
        // Extract test case number from filename
        const testNumber = outputFile.match(/output_(\d+)\.txt/)?.[1];
        if (!testNumber) {
            continue;
        }
        // Read expected output
        const expectedOutput = fs
            .readFileSync(path.join(testCasesPath, outputFile), 'utf8')
            .trim();
        // Read actual output
        const actualOutputPath = path.join(myOutputsPath, `Myoutput_${testNumber}.txt`);
        let actualOutput = '';
        try {
            actualOutput = fs.readFileSync(actualOutputPath, 'utf8').trim();
        }
        catch (error) {
            console.error(`Error reading actual output for test case ${testNumber}:`, error);
        }
        // Store comparison results
        results.push({
            testCase: parseInt(testNumber),
            passed: expectedOutput === actualOutput,
            expected: expectedOutput,
            actual: actualOutput,
        });
    }
    return results;
}
async function compileAndRun(problemPath, language) {
    const config = (0, languageConfig_1.getLanguageConfig)(language);
    const solutionFile = path.join(problemPath, `solution.${config.extension}`);
    // Compile the solution if language requires compilation
    if (config.compile && config.compileCommand) {
        try {
            await execAsync(config.compileCommand(solutionFile));
        }
        catch (error) {
            throw new Error(`Compilation failed: ${error}`);
        }
    }
    // Run the program from the problem directory
    try {
        const runCommand = config.runCommand(solutionFile);
        await execAsync(runCommand, {
            cwd: problemPath, // Set working directory to problem path
        });
    }
    catch (error) {
        throw new Error(`Execution failed: ${error}`);
    }
}
// Main function to run all test cases for the current problem
async function runAllTestCases(context) {
    try {
        // Validate workspace and file setup
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder open');
        }
        // Get current problem directory
        const currentFile = vscode.window.activeTextEditor?.document.uri.fsPath;
        if (!currentFile) {
            throw new Error('No file is currently open');
        }
        const problemPath = path.dirname(currentFile);
        const solutionFile = path.basename(currentFile);
        const language = solutionFile.split('.').pop() || '';
        // Show progress indicator
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Running test cases...',
            cancellable: false,
        }, async (progress) => {
            // Compile and run the solution
            progress.report({ message: 'Compiling and running solution...' });
            await compileAndRun(problemPath, language);
            // Compare test cases
            progress.report({ message: 'Comparing results...' });
            const results = await compareTestCases(problemPath);
            // Display results
            const totalTests = results.length;
            const passedTests = results.filter((r) => r.passed).length;
            // Show detailed results in output channel
            const outputChannel = vscode.window.createOutputChannel('LeetCode Test Results');
            outputChannel.clear();
            outputChannel.appendLine(`Test Results Summary:`);
            outputChannel.appendLine(`Passed: ${passedTests}/${totalTests}\n`);
            // Display individual test results
            results.forEach((result) => {
                outputChannel.appendLine(`Test Case ${result.testCase}: ${result.passed ? 'PASSED' : 'FAILED'}`);
                if (!result.passed) {
                    outputChannel.appendLine(`Expected: ${result.expected}`);
                    outputChannel.appendLine(`Actual: ${result.actual}`);
                }
                outputChannel.appendLine('');
            });
            outputChannel.show();
            // Show summary notification
            const message = `${passedTests}/${totalTests} test cases passed`;
            if (passedTests === totalTests) {
                vscode.window.showInformationMessage(`✅ All test cases passed! ${message}`);
            }
            else {
                vscode.window.showWarningMessage(`❌ Some test cases failed. ${message}`);
            }
        });
    }
    catch (error) {
        // Handle and display any errors
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error running test cases: ${error.message}`);
        }
    }
}
//# sourceMappingURL=runTestCases.js.map