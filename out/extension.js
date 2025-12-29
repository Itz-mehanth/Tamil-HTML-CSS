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
const languages_1 = require("./config/languages");
function activate(context) {
    console.log('Bharat HTML extension is now active!');
    // Helper to inline .tcss or .hcss files
    function processCssLinks(html, originalPath) {
        const dir = path.dirname(originalPath);
        let newHtml = html;
        // 1. Handle <link ... href="... .xyz" ...>
        // Match ANY supported CSS extension dynamically would be expensive regex construction.
        // For now, let's match generic .[a-z]+css pattern or just accept any href and check extension
        // Simplification: Match .tcss, .hcss, .mcss etc. 
        // We will construct a regex from supported extensions.
        const cssExts = languages_1.finalSupportedLanguages.map(l => l.cssExt.replace('.', '')).join('|');
        const linkRegex = new RegExp(`<link[^>]+href=["']([^"']+\\.(${cssExts}))["'][^>]*>`, 'g');
        newHtml = newHtml.replace(linkRegex, (match, cssInfo) => {
            try {
                const cssPath = path.resolve(dir, cssInfo);
                if (fs.existsSync(cssPath)) {
                    // Check extension to load correct locale for CSS compilation
                    const langConfig = (0, languages_1.getLanguageFromExt)(cssPath);
                    const { loadLocale } = require('./compiler');
                    // Load the detected locale (e.g. 'hi' for .hcss), fallback 'ta'
                    loadLocale(langConfig ? langConfig.code : 'ta');
                    const cssContent = fs.readFileSync(cssPath, 'utf8');
                    const css = (0, compiler_1.compileCSS)(cssContent);
                    return `<style>\n/* Inlined from ${cssInfo} */\n${css}\n</style>`;
                }
                else {
                    return match;
                }
            }
            catch (e) {
                console.error("Error inlining css link", e);
                return match;
            }
        });
        // 2. Handle @import "file.tcss/hcss" inside <style>
        const importRegex = new RegExp(`@import\\s+(?:url\\(['"]?|['"])([^'"\\)]+\\.(${cssExts}))(?:['"]?\\)|['"]);?`, 'g');
        newHtml = newHtml.replace(importRegex, (match, cssInfo) => {
            try {
                const cssPath = path.resolve(dir, cssInfo);
                if (fs.existsSync(cssPath)) {
                    const langConfig = (0, languages_1.getLanguageFromExt)(cssPath);
                    const { loadLocale } = require('./compiler');
                    loadLocale(langConfig ? langConfig.code : 'ta');
                    const cssContent = fs.readFileSync(cssPath, 'utf8');
                    const css = (0, compiler_1.compileCSS)(cssContent);
                    return `/* Inlined import ${cssInfo} */\n${css}`;
                }
                else {
                    return match;
                }
            }
            catch (e) {
                console.error("Error inlining css import", e);
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
        const langConfig = (0, languages_1.getLanguageFromExt)(editor.document.fileName);
        if (!langConfig || !langConfig.htmlExt) { // ensure it matches an HTML extension
            // strict check: passed file must match one of the HTML extensions
            const isHtmlExt = languages_1.finalSupportedLanguages.some(l => editor.document.fileName.endsWith(l.htmlExt));
            if (!isHtmlExt) {
                vscode.window.showErrorMessage("Open a Bharat HTML file (e.g., .thtml, .hhtml, .mhtml) to run it.");
                return;
            }
        }
        // Re-get strict config if needed, but the finding logic above is sufficient implicitly
        // We need to re-resolve config effectively if the above check passed.
        const activeLang = (0, languages_1.getLanguageFromExt)(editor.document.fileName);
        try {
            // 0. Detect Language from File Extension
            const { loadLocale } = require('./compiler');
            loadLocale(activeLang ? activeLang.code : 'ta');
            // 1. Compile in memory
            let compiledHtml = (0, compiler_1.compile)(editor.document.getText());
            // 1b. Inline CSS
            compiledHtml = processCssLinks(compiledHtml, editor.document.fileName);
            // 2. Add <base> tag so local images/css work from the temp location
            // We insert it right after <head> or at the top if no head exists
            const folderPath = path.dirname(editor.document.fileName);
            const baseTag = `<base href="file://${folderPath}/">`;
            const finalHtml = compiledHtml.includes("<head>")
                ? compiledHtml.replace("<head>", `<head>\n${baseTag}`)
                : `${baseTag}\n${compiledHtml}`;
            // 3. Write to a TEMP file
            const tempDir = os.tmpdir();
            const pName = path.parse(editor.document.fileName).name;
            const tempFileName = `preview_${pName}.html`;
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
            vscode.window.setStatusBarMessage(`Running ${(activeLang === null || activeLang === void 0 ? void 0 : activeLang.name) || 'Bharat'} HTML preview...`, 3000);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Error compiling code: ${e}`);
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
            currentPanel = vscode.window.createWebviewPanel('thtmlPreview', 'Bharat HTML Preview', vscode.ViewColumn.Beside, { enableScripts: true });
            currentPanel.onDidDispose(() => { currentPanel = undefined; }, null, context.subscriptions);
        }
        updatePreview(currentPanel, editor.document);
    });
    context.subscriptions.push(previewDisposable);
    // Update preview on type
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        var _a;
        // Check if doc is any supported language
        const langCode = (0, languages_1.getLanguageFromExt)(e.document.fileName);
        if (currentPanel && langCode && e.document.fileName === ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.fileName)) {
            updatePreview(currentPanel, e.document);
        }
    }));
    function updatePreview(panel, document) {
        try {
            const langConfig = (0, languages_1.getLanguageFromExt)(document.fileName);
            const { loadLocale } = require('./compiler');
            loadLocale(langConfig ? langConfig.code : 'ta');
            let compiledHtml = (0, compiler_1.compile)(document.getText());
            // Inline CSS
            compiledHtml = processCssLinks(compiledHtml, document.fileName);
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
    // 5. Register IntelliSense for ALL Languages
    languages_1.finalSupportedLanguages.forEach(lang => {
        // HTML Provider
        const htmlProvider = vscode.languages.registerCompletionItemProvider(lang.id || lang.code + 'html', // ID fallback
        {
            provideCompletionItems(document, position) {
                const completionItems = [];
                // Load specific locale for this request
                const { loadLocale, htmlMap } = require('./compiler');
                loadLocale(lang.code);
                for (const [nativeTag, htmlTag] of Object.entries(htmlMap)) {
                    const item = new vscode.CompletionItem(nativeTag, vscode.CompletionItemKind.Keyword);
                    item.detail = `<${htmlTag}>`;
                    item.documentation = new vscode.MarkdownString(`Equivalent to HTML **<${htmlTag}>** tag.`);
                    item.insertText = new vscode.SnippetString(`${nativeTag}>$0</${nativeTag}>`);
                    completionItems.push(item);
                }
                return completionItems;
            }
        }, '<');
        context.subscriptions.push(htmlProvider);
        // CSS Provider
        const cssProvider = vscode.languages.registerCompletionItemProvider(lang.cssId || lang.code + 'css', // ID fallback
        {
            provideCompletionItems(document, position) {
                const completionItems = [];
                const { loadLocale, cssMap, htmlMap } = require('./compiler');
                loadLocale(lang.code);
                // CSS Properties
                for (const [native, eng] of Object.entries(cssMap)) {
                    const item = new vscode.CompletionItem(native, vscode.CompletionItemKind.Property);
                    item.detail = `${eng}`;
                    item.documentation = new vscode.MarkdownString(`CSS: **${eng}**`);
                    completionItems.push(item);
                }
                // HTML Selectors
                for (const [native, eng] of Object.entries(htmlMap)) {
                    const item = new vscode.CompletionItem(native, vscode.CompletionItemKind.Class);
                    item.detail = `${eng}`;
                    item.documentation = new vscode.MarkdownString(`Selector: **${eng}**`);
                    completionItems.push(item);
                }
                return completionItems;
            }
        });
        context.subscriptions.push(cssProvider);
    });
    // 6. Error Diagnostics (Red Squigglies)
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('bharat-html');
    context.subscriptions.push(diagnosticCollection);
    function updateDiagnostics(document, collection) {
        const langConfig = (0, languages_1.getLanguageFromExt)(document.fileName);
        if (!langConfig)
            return;
        // Ensure we are in a valid file for this extension
        if (!document.fileName.endsWith(langConfig.htmlExt))
            return;
        // Load Locale - import the module, not destructure yet
        const compiler = require('./compiler');
        compiler.loadLocale(langConfig.code);
        // NOW get the htmlMap after it's been updated
        const validTags = Object.keys(compiler.htmlMap);
        const text = document.getText();
        const diagnostics = [];
        const regex = /<\/?([^>\s]+)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const tagName = match[1];
            if (tagName.startsWith('!') || tagName.includes('?')) {
                continue;
            }
            if (!validTags.includes(tagName)) {
                const startPos = document.positionAt(match.index + match[0].indexOf(tagName));
                const endPos = document.positionAt(match.index + match[0].indexOf(tagName) + tagName.length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, `Unknown ${langConfig.name} tag: '${tagName}'.`, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
            }
        }
        collection.set(document.uri, diagnostics);
    }
    // Trigger diagnostics
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        updateDiagnostics(event.document, diagnosticCollection);
    }));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDiagnostics(editor.document, diagnosticCollection);
        }
    }));
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map