// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "hightlight-errors" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand("hightlight-errors.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from hightlight-errors!");
    console.log("Hello World from hightlight-errors!");
  });

  context.subscriptions.push(disposable);

  // Register command to print code actions
  const printCodeActionsCommand = vscode.commands.registerCommand(
    "highlight-errors.executeCodeAction",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active editor!");
        return;
      }

      const position = editor.selection.active;
      const range =
        editor.document.getWordRangeAtPosition(position) || new vscode.Range(position, position);

      try {
        const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
          "vscode.executeCodeActionProvider",
          editor.document.uri,
          range,
        );

        // Check for import-related actions
        const importActions =
          codeActions?.filter(
            (action) =>
              action.title.toLowerCase().includes("import") &&
              !action.title.toLowerCase().includes("all missing imports"),
          ) || [];

        console.log(
          "Found import-related actions:",
          importActions.map((action) => ({
            title: action.title,
            kind: action.kind?.value,
          })),
        );

        if (importActions.length === 1) {
          // Execute the single import action
          const action = importActions[0];
          if (action.edit) {
            await vscode.workspace.applyEdit(action.edit);
          }
          if (action.command) {
            await vscode.commands.executeCommand(
              action.command.command,
              ...(action.command.arguments || []),
            );
          }
        } else {
          // Show regular code actions menu for all actions
          await vscode.commands.executeCommand("editor.action.quickFix");
        }
      } catch (error) {
        console.error("Error fetching code actions:", error);
      }
    },
  );

  context.subscriptions.push(printCodeActionsCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
