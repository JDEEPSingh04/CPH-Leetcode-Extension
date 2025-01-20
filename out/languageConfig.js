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
exports.LANGUAGE_BOILERPLATES = void 0;
exports.isLanguageSupported = isLanguageSupported;
exports.getLanguageConfig = getLanguageConfig;
exports.getFileExtension = getFileExtension;
exports.getCompileCommand = getCompileCommand;
exports.getRunCommand = getRunCommand;
const path = __importStar(require("path"));
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
        runCommand: (filepath) => `python ${filepath}`,
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
    // Java Configuration
    java: {
        extension: 'java',
        getLangSlug: () => 'java',
        compile: true,
        compileCommand: (filepath) => `javac ${filepath}`,
        runCommand: (filepath) => `java -cp ${path.dirname(filepath)} Solution`,
        template: `import java.io.*;
import java.util.*;

public class Solution {
    // Your solution code goes here
    
    public static void runTestCase(int testNumber) {
        String inputPath = "./test_cases/input_" + testNumber + ".txt";
        
        try {
            // Read input
            BufferedReader reader = new BufferedReader(new FileReader(inputPath));
            
            /* Example for reading numbers:
            String line = reader.readLine();
            String[] parts = line.trim().split("\\s+");
            int[] numbers = Arrays.stream(parts)
                                .mapToInt(Integer::parseInt)
                                .toArray();
            */
            
            reader.close();
            
            // Call your solution method
            // Type result = solve(parameters);
            
            // Create output directory if it doesn't exist
            File outputDir = new File("./myOutputs");
            if (!outputDir.exists()) {
                outputDir.mkdirs();
            }
            
            // Write output
            String outputPath = "./myOutputs/Myoutput_" + testNumber + ".txt";
            BufferedWriter writer = new BufferedWriter(new FileWriter(outputPath));
            
            /* Example for writing result:
            writer.write(String.valueOf(result));
            // Or for array:
            writer.write(Arrays.stream(result)
                              .mapToObj(String::valueOf)
                              .collect(Collectors.joining(" ")));
            */
            
            writer.close();
            
        } catch (IOException e) {
            System.err.println("Error processing test case " + testNumber + ": " + e.getMessage());
        }
    }
    
    public static void main(String[] args) {
        File testCasesDir = new File("./test_cases");
        if (!testCasesDir.exists() || !testCasesDir.isDirectory()) {
            System.err.println("test_cases directory not found");
            return;
        }
        
        File[] inputFiles = testCasesDir.listFiles((dir, name) -> name.startsWith("input_"));
        if (inputFiles == null) {
            System.err.println("Error reading test cases");
            return;
        }
        
        Arrays.sort(inputFiles);
        for (File inputFile : inputFiles) {
            String fileName = inputFile.getName();
            int testNumber = Integer.parseInt(fileName.substring(6, fileName.length() - 4));
            runTestCase(testNumber);
        }
    }
}`,
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

function runTestCase(testNumber) {
    const inputPath = path.join('./test_cases', \`input_\${testNumber}.txt\`);
    
    try {
        // Read input
        const input = fs.readFileSync(inputPath, 'utf8').trim();
        
        /* Example for parsing numbers:
        const numbers = input.split(/\\s+/).map(Number);
        */
        
        // Call your solution method
        // const result = solve(parameters);
        
        // Create output directory if it doesn't exist
        const outputDir = './myOutputs';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        
        // Write output
        const outputPath = path.join(outputDir, \`Myoutput_\${testNumber}.txt\`);
        
        /* Example for writing result:
        fs.writeFileSync(outputPath, String(result));
        // Or for array:
        fs.writeFileSync(outputPath, result.join(' '));
        */
        
    } catch (error) {
        console.error(\`Error processing test case \${testNumber}: \${error.message}\`);
    }
}

function main() {
    const testCasesDir = './test_cases';
    if (!fs.existsSync(testCasesDir)) {
        console.error('test_cases directory not found');
        return;
    }
    
    const inputFiles = fs.readdirSync(testCasesDir)
        .filter(file => file.startsWith('input_'))
        .sort();
    
    for (const inputFile of inputFiles) {
        const testNumber = inputFile.match(/input_(\d+)\.txt/)[1];
        runTestCase(testNumber);
    }
}

main();`,
    },
};
// Helper function to validate language support
function isLanguageSupported(language) {
    return language in exports.LANGUAGE_BOILERPLATES;
}
// Helper function to get language configuration
function getLanguageConfig(language) {
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