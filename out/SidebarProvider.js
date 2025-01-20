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
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
// SidebarProvider class implements the webview for extension commands Manages UI interactions and command execution
class SidebarProvider {
    _extensionUri;
    static viewType = 'cph-commands';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    //   Called when webview is first created or becomes visible Sets up webview options and HTML content
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        // Enable scripts in webview
        webviewView.webview.options = {
            enableScripts: true,
        };
        // Set initial HTML content
        webviewView.webview.html = this._getHtmlForWebview();
        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.command) {
                case 'CPH.fetchProblem':
                    await vscode.commands.executeCommand('CPH.fetchProblem');
                    break;
                case 'CPH.runTestCases':
                    await vscode.commands.executeCommand('CPH.runTestCases');
                    break;
                case 'CPH.addTestCase':
                    await vscode.commands.executeCommand('CPH.addTestCase');
                    break;
            }
        });
    }
    //   Generates HTML content for the webview Creates buttons and styles for command execution
    _getHtmlForWebview() {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            .command-button {
              width: 100%;
              padding: 8px;
              margin: 4px 0;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              border-radius: 2px;
              cursor: pointer;
            }
            .command-button:hover {
              background: var(--vscode-button-hoverBackground);
            }
          </style>
        </head>
        <body>
          <h3>LeetCode Helper Commands</h3>
          <button class="command-button" onclick="fetchProblem()">
            <i class="codicon codicon-cloud-download"></i> Fetch Problem
          </button>
          <button class="command-button" onclick="runTests()">
            <i class="codicon codicon-play"></i> Run Tests
          </button>
          <button class="command-button" onclick="addTest()">
            <i class="codicon codicon-add"></i> Add Test Case
          </button>
          
          <script>
            const vscode = acquireVsCodeApi();
            
            function fetchProblem() {
              vscode.postMessage({ command: 'CPH.fetchProblem' });
            }
            
            function runTests() {
              vscode.postMessage({ command: 'CPH.runTestCases' });
            }
            
            function addTest() {
              vscode.postMessage({ command: 'CPH.addTestCase' });
            }
          </script>
        </body>
      </html>
    `;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=SidebarProvider.js.map