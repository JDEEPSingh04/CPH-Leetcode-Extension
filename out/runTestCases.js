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
exports.createSolutionFile = createSolutionFile;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const languageConfig_1 = require("./languageConfig");
exports.LANGUAGE_BOILERPLATES = {
    cpp: {
        extension: 'cpp',
        getLangSlug: () => 'cpp',
    },
    python: {
        extension: 'py',
        getLangSlug: () => 'python',
    },
};
async function createSolutionFile(titleSlug, language, problemPath) {
    try {
        const { extension, template } = (0, languageConfig_1.getLanguageConfig)(language);
        const solutionFile = path.join(problemPath, `solution.${extension}`);
        // Check if solution file already exists
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
//# sourceMappingURL=runTestCases.js.map