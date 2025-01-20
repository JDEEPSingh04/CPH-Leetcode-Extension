import * as vscode from 'vscode'

// SidebarProvider class implements the webview for extension commands Manages UI interactions and command execution

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'cph-commands'
  private _view?: vscode.WebviewView

  constructor(private readonly _extensionUri: vscode.Uri) {}

  //   Called when webview is first created or becomes visible Sets up webview options and HTML content
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    // Enable scripts in webview
    webviewView.webview.options = {
      enableScripts: true,
    }

    // Set initial HTML content
    webviewView.webview.html = this._getHtmlForWebview()

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'CPH.fetchProblem':
          await vscode.commands.executeCommand('CPH.fetchProblem')
          break
        case 'CPH.runTestCases':
          await vscode.commands.executeCommand('CPH.runTestCases')
          break
        case 'CPH.addTestCase':
          await vscode.commands.executeCommand('CPH.addTestCase')
          break
      }
    })
  }

  //   Generates HTML content for the webview Creates buttons and styles for command execution
  private _getHtmlForWebview() {
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
    `
  }
}
