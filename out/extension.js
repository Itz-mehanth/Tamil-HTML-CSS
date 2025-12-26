"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const path = require("path");
const compiler_1 = require("./compiler");
const child_process_1 = require("child_process");
function activate(context) {
    console.log('Tamil HTML extension is now active!');
    // Compile CSS on save - REMOVED to keep workspace clean
    // We now inline TCSS during Run/Preview
    // Helper to inline .tcss files
    function processTcssLinks(html, originalPath) {
        const dir = path.dirname(originalPath);
        let newHtml = html;
        // 1. Handle <link ... href="... .tcss" ...>
        newHtml = newHtml.replace(/<link[^>]+href=["']([^"']+\.tcss)["'][^>]*>/g, (match, tcssInfo) => {
            try {
                const tcssPath = path.resolve(dir, tcssInfo);
                if (fs.existsSync(tcssPath)) {
                    const tcssContent = fs.readFileSync(tcssPath, 'utf8');
                    const css = (0, compiler_1.compileCSS)(tcssContent);
                    return `<style>\n/* Inlined from ${tcssInfo} */\n${css}\n</style>`;
                }
                else {
                    return match;
                }
            }
            catch (e) {
                console.error("Error inlining tcss link", e);
                return match;
            }
        });
        // 2. Handle @import "file.tcss" inside <style>
        // Use regex for @import url(...) or @import "..."
        // After compilation, @இறக்குமதி becomes @import
        newHtml = newHtml.replace(/@import\s+(?:url\(['"]?|['"])([^'"\)]+\.tcss)(?:['"]?\)|['"]);?/g, (match, tcssInfo) => {
            try {
                const tcssPath = path.resolve(dir, tcssInfo);
                if (fs.existsSync(tcssPath)) {
                    const tcssContent = fs.readFileSync(tcssPath, 'utf8');
                    const css = (0, compiler_1.compileCSS)(tcssContent);
                    // Replace the @import line with the actual CSS content
                    return `/* Inlined import ${tcssInfo} */\n${css}`;
                }
                else {
                    return match;
                }
            }
            catch (e) {
                console.error("Error inlining tcss import", e);
                return match;
            }
        });
        return newHtml;
    }
    let runDisposable = vscode.commands.registerCommand("thtml.run", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found");
            return;
        }
        if (!editor.document.fileName.endsWith(".thtml")) {
            vscode.window.showErrorMessage("Open a .thtml file to run it.");
            return;
        }
        try {
            // 1. Compile in memory
            const compiledHtml = (0, compiler_1.compile)(editor.document.getText());
            // 2. Add <base> tag so local images/css work from the temp location
            // We insert it right after <head> or at the top if no head exists
            const folderPath = path.dirname(editor.document.fileName);
            const baseTag = `<base href="file://${folderPath}/">`;
            const finalHtml = compiledHtml.includes("<head>")
                ? compiledHtml.replace("<head>", `<head>\n${baseTag}`)
                : `${baseTag}\n${compiledHtml}`;
            // 3. Write to a TEMP file (hidden from user workspace)
            const tempDir = os.tmpdir();
            const tempFileName = `preview_${path.basename(editor.document.fileName)}.html`;
            const tempFilePath = path.join(tempDir, tempFileName);
            fs.writeFileSync(tempFilePath, finalHtml);
            // 4. Open the TEMP file in browser
            const cmd = process.platform === 'win32' ? `start "" "${tempFilePath}"` :
                process.platform === 'darwin' ? `open "${tempFilePath}"` :
                    `xdg-open "${tempFilePath}"`;
            (0, child_process_1.exec)(cmd, (err) => {
                if (err) {
                    vscode.window.showErrorMessage("Could not open browser: " + err.message);
                }
            });
            vscode.window.setStatusBarMessage(`Running THTML preview...`, 3000);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Error compiling thtml: ${e}`);
        }
    });
    context.subscriptions.push(runDisposable);
    // Live Preview Command
    let currentPanel = undefined;
    let previewDisposable = vscode.commands.registerCommand("thtml.preview", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.Beside);
        }
        else {
            currentPanel = vscode.window.createWebviewPanel('thtmlPreview', 'Tamil HTML Preview', vscode.ViewColumn.Beside, { enableScripts: true });
            currentPanel.onDidDispose(() => { currentPanel = undefined; }, null, context.subscriptions);
        }
        updatePreview(currentPanel, editor.document);
    });
    context.subscriptions.push(previewDisposable);
    // Update preview on type
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        var _a;
        if (currentPanel && e.document.languageId === 'thtml' && e.document === ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document)) {
            updatePreview(currentPanel, e.document);
        }
    }));
    function updatePreview(panel, document) {
        try {
            let compiledHtml = (0, compiler_1.compile)(document.getText());
            // Inline TCSS for Preview Panel too
            compiledHtml = processTcssLinks(compiledHtml, document.fileName);
            // Add <base> tag using Webview URI scheme so local CSS works
            const folderPath = vscode.Uri.file(path.dirname(document.fileName));
            const baseUri = panel.webview.asWebviewUri(folderPath);
            const baseTag = `<base href="${baseUri}/">`;
            const finalHtml = compiledHtml.includes("<head>")
                ? compiledHtml.replace("<head>", `<head>\n${baseTag}`)
                : `${baseTag}\n${compiledHtml}`;
            panel.webview.html = finalHtml;
        }
        catch (e) {
            // ignore compilation errors during typing
        }
    }
    // IntelliSense Provider
    const provider = vscode.languages.registerCompletionItemProvider('thtml', {
        provideCompletionItems(document, position) {
            const completionItems = [];
            // Import map dynamically or use the imported one
            const { htmlMap } = require('./compiler');
            for (const [tamilTag, htmlTag] of Object.entries(htmlMap)) {
                // Simple tag suggestion
                const item = new vscode.CompletionItem(tamilTag, vscode.CompletionItemKind.Keyword);
                item.detail = `<${htmlTag}>`;
                item.documentation = new vscode.MarkdownString(`Equivalent to HTML **<${htmlTag}>** tag.`);
                item.insertText = new vscode.SnippetString(`${tamilTag}>$0</${tamilTag}>`); // Auto-close snippet
                completionItems.push(item);
            }
            return completionItems;
        }
    }, '<' // Trigger character
    );
    context.subscriptions.push(provider);
    // TCSS IntelliSense Provider
    const tcssProvider = vscode.languages.registerCompletionItemProvider('tcss', {
        provideCompletionItems(document, position) {
            const completionItems = [];
            const { cssMap, htmlMap } = require('./compiler');
            // 1. Suggest CSS Properties/Values
            for (const [tamil, eng] of Object.entries(cssMap)) {
                const item = new vscode.CompletionItem(tamil, vscode.CompletionItemKind.Property);
                item.detail = `${eng}`;
                item.documentation = new vscode.MarkdownString(`CSS: **${eng}**`);
                completionItems.push(item);
            }
            // 2. Suggest HTML Tags (for selectors)
            for (const [tamil, eng] of Object.entries(htmlMap)) {
                const item = new vscode.CompletionItem(tamil, vscode.CompletionItemKind.Class);
                item.detail = `${eng}`;
                item.documentation = new vscode.MarkdownString(`Selector: **${eng}**`);
                completionItems.push(item);
            }
            return completionItems;
        }
    }
    // Trigger on typing anything (implicit)
    );
    context.subscriptions.push(tcssProvider);
    // Error Diagnostics (Red Squigglies)
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('thtml');
    context.subscriptions.push(diagnosticCollection);
    function updateDiagnostics(document, collection) {
        if (!document.fileName.endsWith('.thtml'))
            return;
        const { htmlMap } = require('./compiler');
        const validTags = Object.keys(htmlMap);
        const text = document.getText();
        const diagnostics = [];
        // Regex to match <tag or </tag
        const regex = /<\/?([^>\s]+)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const tagName = match[1];
            // Ignore comments <!-- ... --> and !DOCTYPE
            if (tagName.startsWith('!')) {
                continue;
            }
            // Check if it's a valid Tamil tag
            if (!validTags.includes(tagName)) {
                // calculate range of the tag name
                const startPos = document.positionAt(match.index + match[0].indexOf(tagName));
                const endPos = document.positionAt(match.index + match[0].indexOf(tagName) + tagName.length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, `Unknown Tamil tag: '${tagName}'.`, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
            }
        }
        collection.set(document.uri, diagnostics);
    }
    // Trigger diagnostics on change and open
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        updateDiagnostics(event.document, diagnosticCollection);
    }));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDiagnostics(editor.document, diagnosticCollection);
        }
    }));
    // Initial check
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map