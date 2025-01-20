"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGUAGE_BOILERPLATES = void 0;
exports.getLanguageFromExtension = getLanguageFromExtension;
exports.isLanguageSupported = isLanguageSupported;
exports.getLanguageConfig = getLanguageConfig;
exports.getFileExtension = getFileExtension;
exports.getCompileCommand = getCompileCommand;
exports.getRunCommand = getRunCommand;
// Mapping of file extensions to language identifiers  
const EXTENSION_TO_LANGUAGE = {
    cpp: 'cpp',
    py: 'python',
    js: 'javascript',
};
/**
 * Configuration for all supported programming languages
 * Each language defines:
 * - File extension
 * - Language identifier
 * - Compilation requirements
 * - Execution commands
 * - Code template with test case handling
 */
exports.LANGUAGE_BOILERPLATES = {
    // C++ Configuration
    cpp: {
        extension: 'cpp',
        getLangSlug: () => 'cpp',
        compile: true,
        compileCommand: (filepath) => `g++ -std=c++17 ${filepath} -o ${filepath}.out`,
        runCommand: (filepath) => `${filepath}.out`,
        template: `#include <bits/stdc++.h>
using namespace std;

//write the code logic here 

// Function to run the test case
void runTestCase(int n) {
    string filePath = "./test_cases/input_" + to_string(n) + ".txt";
    ifstream file(filePath);

    if (!file.is_open()) {
        cerr << "Error: File not found at " << filePath << ". Check the file path and try again." << endl;
        return;
    }

    /*  To read numbers from the file and store them in a vector, use the following code:
    vector<int> numbers;
    int number;
    while (file >> number) {  // Read integers from the file
        numbers.push_back(number);  // Store them in the vector
    }
    int target=numbers.back();
    numbers.pop_back();
    */
    file.close();

    // Call the function and print the result (pass all the variables)
    // <data type> result = solve(<variables>);

    std::filesystem::path outputDir("./myOutputs");
    if (!std::filesystem::exists(outputDir)) {
        std::filesystem::create_directory(outputDir);  // Create the directory
    }

    // Create a unique output file name in the new directory
    string outputFilePath = outputDir.string() + "/Myoutput_" + to_string(n) + ".txt";  
    ofstream outputFile(outputFilePath, std::ios::trunc);  // This will create the file if it doesn't exist and empty it if it does

    if (!outputFile.is_open()) {
        std::cerr << "Error: Could not create the output file." << std::endl;
        return;
    }

    /*  To write numbers to the output file, use the following code:
    for (int ans : result) {
        outputFile << ans << " ";  // Write each number on a new line
    }
    */

    outputFile.close();  // Close the output file
}

int main() {
    // Define the path to the test_cases directory
    std::filesystem::path testCasesDir("./test_cases");

    // Check if the directory exists
    if (!std::filesystem::exists(testCasesDir) || !std::filesystem::is_directory(testCasesDir)) {
        cerr << "Directory does not exist or is not a directory." << endl;
        return 1;
    }

    // Iterate over all the testCases
    int testCases=1;
    for (const auto& entry : std::filesystem::directory_iterator(testCasesDir)) {
        if (std::filesystem::is_regular_file(entry)) {
            std::string filename = entry.path().filename().string();
            // Check if the filename starts with "input_"
            if (filename.size() >= 6 && filename.substr(0, 6) == "input_") {
                runTestCase(testCases);
                testCases++;
            }
        }
    }

    return 0;
}`,
    },
    // Python Configuration
    python: {
        extension: 'py',
        getLangSlug: () => 'python',
        compile: false,
        runCommand: (filepath) => `python3 ${filepath}`,
        template: `import os
import json

def read_test_case(test_number):
    """
    Read test case from input file
    """
    test_case_path = f"./test_cases/input_{test_number}.txt"
    if not os.path.exists(test_case_path):
        print(f"Error: File not found at {test_case_path}")
        return None
    
    with open(test_case_path, 'r') as f:
        # Read input and parse as needed
        # Example for reading numbers:
        # numbers = list(map(int, f.read().strip().split()))
        # return numbers
        return f.read().strip()

def write_output(test_number, result):
    """
    Write test result to output file
    """
    output_dir = "./myOutputs"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_path = f"{output_dir}/Myoutput_{test_number}.txt"
    with open(output_path, 'w') as f:
        # Write result in appropriate format
        # Example for writing a list of numbers:
        # f.write(' '.join(map(str, result)))
        f.write(str(result))

def solve():
    """
    Your solution code goes here
    """
    pass

def main():
    # Get all input files
    test_cases_dir = "./test_cases"
    if not os.path.exists(test_cases_dir):
        print("Error: test_cases directory not found")
        return
    
    input_files = [f for f in os.listdir(test_cases_dir) if f.startswith('input_')]
    
    for input_file in sorted(input_files):
        test_number = input_file.split('_')[1].split('.')[0]
        
        # Read test case
        test_case = read_test_case(test_number)
        if test_case is None:
            continue
        
        # Run solution
        result = solve()
        
        # Write output
        write_output(test_number, result)

if __name__ == "__main__":
    main()`,
    },
    // JavaScript Configuration
    javascript: {
        extension: 'js',
        getLangSlug: () => 'javascript',
        compile: false,
        runCommand: (filepath) => `node ${filepath}`,
        template: `const fs = require('fs');
const path = require('path');

// Your solution code goes here
// Example:
// function twoSum(nums, target) {
//     return [];
// }

function readTestCase(testNumber) {
    const inputPath = path.join('./test_cases', \`input_\${testNumber}.txt\`);
    
    try {
        // Read input
        const input = fs.readFileSync(inputPath, 'utf8').trim();
        
        // Parse numbers from space-separated string
        const numbers = input.split(/\\s+/).map(Number);
        return numbers;
        
    } catch (error) {
        console.error(\`Error reading test case \${testNumber}: \${error.message}\`);
        return null;
    }
}

function writeOutput(testNumber, result) {
    const outputDir = './myOutputs';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const outputPath = path.join(outputDir, \`Myoutput_\${testNumber}.txt\`);
    
    try {
        // Convert result to space-separated string if it's an array
        const output = Array.isArray(result) ? result.join(' ') : String(result);
        fs.writeFileSync(outputPath, output);
    } catch (error) {
        console.error(\`Error writing output for test case \${testNumber}: \${error.message}\`);
    }
}

function runTestCase(testNumber) {
    const numbers = readTestCase(testNumber);
    if (!numbers) return;

    // Get the last number as target (for two sum problem)
    const target = numbers[numbers.length - 1];
    const nums = numbers.slice(0, -1);

    // Call your solution function here
    // Example for two sum:
    // const result = twoSum(nums, target);
    const result = [];  // Replace this with your actual solution call
    
    writeOutput(testNumber, result);
}

function main() {
    const testCasesDir = './test_cases';
    if (!fs.existsSync(testCasesDir)) {
        console.error('test_cases directory not found');
        return;
    }
    
    // Get all input files and sort them
    const inputFiles = fs.readdirSync(testCasesDir)
        .filter(file => file.startsWith('input_'))
        .sort((a, b) => {
            const numA = parseInt(a.match(/input_(\d+)\.txt/)[1]);
            const numB = parseInt(b.match(/input_(\d+)\.txt/)[1]);
            return numA - numB;
        });
    
    for (const inputFile of inputFiles) {
        const match = inputFile.match(/input_(\d+)\.txt/);
        if (match) {
            const testNumber = match[1];
            runTestCase(testNumber);
        }
    }
}

main();`,
    },
};
// Helper function to get language from file extension
function getLanguageFromExtension(extension) {
    const language = EXTENSION_TO_LANGUAGE[extension];
    if (!language) {
        throw new Error(`Unsupported file extension: ${extension}`);
    }
    return language;
}
// Helper function to validate language support
function isLanguageSupported(language) {
    return language in exports.LANGUAGE_BOILERPLATES;
}
function getLanguageConfig(language) {
    // If we get an extension instead of a language name, convert it
    if (language in EXTENSION_TO_LANGUAGE) {
        language = EXTENSION_TO_LANGUAGE[language];
    }
    if (!isLanguageSupported(language)) {
        throw new Error(`Unsupported language: ${language}`);
    }
    return exports.LANGUAGE_BOILERPLATES[language];
}
// Helper function to get file extension for a language
function getFileExtension(language) {
    return getLanguageConfig(language).extension;
}
// Helper function to get compile command if applicable
function getCompileCommand(language, filepath) {
    const config = getLanguageConfig(language);
    return config.compile && config.compileCommand
        ? config.compileCommand(filepath)
        : undefined;
}
// Helper function to get run command for a language
function getRunCommand(language, filepath) {
    const config = getLanguageConfig(language);
    return config.runCommand(filepath);
}
//# sourceMappingURL=languageConfig.js.map