// languageConfig.ts
export interface LanguageConfig {
  extension: string
  getLangSlug: string
  template: string
}

export const LANGUAGE_BOILERPLATES: Record<string, LanguageConfig> = {
  cpp: {
    extension: 'cpp',
    getLangSlug: 'cpp',
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
}
`,
  },
  python: {
    extension: 'py',
    getLangSlug: 'python3',
    template: `import os

# Function to run test cases
run_test_case = lambda n, f: (
    print(
        (
            lambda p: (
                lambda a: f(*a)
            )(eval(l.strip()) for l in open(p).read().strip().splitlines()) 
            if os.path.isfile(p) else f"Error: File not found at {p}. Check the file path and try again."
        )(
            (lambda d: os.path.join(d, 'test_cases', f"input_{n}.txt"))(
                os.path.dirname(os.path.dirname(__file__))
            )
        )
    )
   
)


# Example usage
# Uncomment the below line for testing
# run_test_cases(TEST_CASE_NUMBER,FUNCTION WHERE YOUR CODE LOGIC IS PRESENT)
run_test_case()
`,
  },
}

// Helper function to validate language support
export function isLanguageSupported(language: string): boolean {
  return language in LANGUAGE_BOILERPLATES
}

// Helper function to get language configuration
export function getLanguageConfig(language: string): LanguageConfig {
  if (!isLanguageSupported(language)) {
    throw new Error(`Unsupported language: ${language}`)
  }
  return LANGUAGE_BOILERPLATES[language]
}
