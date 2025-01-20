"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGUAGE_BOILERPLATES = void 0;
exports.isLanguageSupported = isLanguageSupported;
exports.getLanguageConfig = getLanguageConfig;
exports.LANGUAGE_BOILERPLATES = {
    cpp: {
        extension: 'cpp',
        getLangSlug: 'cpp',
        template: `class Solution {
public:
    // TODO: Add your solution here
};`,
    },
    python: {
        extension: 'py',
        getLangSlug: 'python3',
        template: `class Solution:
    def __init__(self):
        pass
    
    # TODO: Add your solution here`,
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
//# sourceMappingURL=createSolutionFile.js.map