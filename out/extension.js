"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const translationPanel_1 = require("./translationPanel");
function activate(context) {
    console.log('Bharat HTML extension is now active!');
    // Register Translation Panel
    const translationPanel = (0, translationPanel_1.registerTranslationPanel)(context);
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
    // 3. Language Switcher Command
    const switchLanguageCommand = vscode.commands.registerCommand('thtml.switchLanguage', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const currentLang = (0, languages_1.getLanguageFromExt)(editor.document.fileName);
        if (!currentLang) {
            vscode.window.showErrorMessage('Current file is not a Bharat HTML/CSS file');
            return;
        }
        // Show language picker
        const items = languages_1.finalSupportedLanguages
            .filter(l => l.code !== currentLang.code)
            .map(l => ({
            label: l.name,
            description: `${l.htmlExt} / ${l.cssExt}`,
            langConfig: l
        }));
        const selected = yield vscode.window.showQuickPick(items, {
            placeHolder: `Convert from ${currentLang.name} to...`
        });
        if (!selected)
            return;
        const targetLang = selected.langConfig;
        // Detect if this is HTML or CSS file
        const isHtmlFile = editor.document.fileName.endsWith(currentLang.htmlExt);
        const isCssFile = editor.document.fileName.endsWith(currentLang.cssExt);
        // Load both locales
        const compiler = require('./compiler');
        compiler.loadLocale(currentLang.code);
        const sourceHtmlMap = Object.assign({}, compiler.htmlMap);
        const sourceCssMap = Object.assign({}, compiler.cssMap);
        compiler.loadLocale(targetLang.code);
        const targetHtmlMap = Object.assign({}, compiler.htmlMap);
        const targetCssMap = Object.assign({}, compiler.cssMap);
        // Choose the appropriate map based on file type
        const sourceMap = isHtmlFile ? sourceHtmlMap : sourceCssMap;
        const targetMap = isHtmlFile ? targetHtmlMap : targetCssMap;
        // Create reverse map (english -> native) for target
        const reverseTargetMap = {};
        for (const [native, eng] of Object.entries(targetMap)) {
            reverseTargetMap[eng] = native;
        }
        // Convert the code
        let convertedCode = editor.document.getText();
        for (const [sourceNative, englishTag] of Object.entries(sourceMap)) {
            const targetNative = reverseTargetMap[englishTag];
            if (targetNative && sourceNative !== targetNative) {
                if (isHtmlFile) {
                    // For HTML: Replace tags with angle brackets
                    const regex = new RegExp(`<(\/?)${sourceNative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([ >])`, 'g');
                    convertedCode = convertedCode.replace(regex, `<$1${targetNative}$2`);
                }
                else if (isCssFile) {
                    // For CSS: Replace property names (word boundaries)
                    const regex = new RegExp(`\\b${sourceNative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    convertedCode = convertedCode.replace(regex, targetNative);
                }
            }
        }
        // Create new file
        const oldPath = editor.document.fileName;
        const newExt = oldPath.endsWith(currentLang.htmlExt) ? targetLang.htmlExt : targetLang.cssExt;
        const oldExt = oldPath.endsWith(currentLang.htmlExt) ? currentLang.htmlExt : currentLang.cssExt;
        const newPath = oldPath.replace(oldExt, newExt);
        yield vscode.workspace.fs.writeFile(vscode.Uri.file(newPath), Buffer.from(convertedCode, 'utf8'));
        const doc = yield vscode.workspace.openTextDocument(newPath);
        yield vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(`Converted ${currentLang.name} → ${targetLang.name}`);
    }));
    context.subscriptions.push(switchLanguageCommand);
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
    // 5b. Hover Documentation for ALL Languages
    languages_1.finalSupportedLanguages.forEach(lang => {
        const hoverProvider = vscode.languages.registerHoverProvider(lang.id, {
            provideHover(document, position) {
                const compiler = require('./compiler');
                compiler.loadLocale(lang.code);
                const range = document.getWordRangeAtPosition(position);
                if (!range)
                    return;
                const word = document.getText(range);
                const htmlTag = compiler.htmlMap[word];
                if (htmlTag) {
                    const markdown = new vscode.MarkdownString();
                    markdown.appendMarkdown(`**${word}** → \`<${htmlTag}>\`\n\n`);
                    // Add descriptions for common tags
                    const descriptions = {
                        'html': 'The root element of an HTML document',
                        'head': 'Contains metadata and document information',
                        'title': 'Defines the document title shown in browser tab',
                        'body': 'Contains the visible page content',
                        'h1': 'Main heading (largest)',
                        'p': 'Paragraph of text',
                        'button': 'Clickable button element',
                        'link': 'Links external resources like CSS files',
                        'div': 'Generic container for grouping elements',
                        'span': 'Inline container for text'
                    };
                    if (descriptions[htmlTag]) {
                        markdown.appendMarkdown(`*${descriptions[htmlTag]}*`);
                    }
                    return new vscode.Hover(markdown);
                }
                return undefined;
            }
        });
        context.subscriptions.push(hoverProvider);
    });
    // 5b2. Hover Documentation for CSS
    languages_1.finalSupportedLanguages.forEach(lang => {
        const cssHoverProvider = vscode.languages.registerHoverProvider(lang.cssId, {
            provideHover(document, position) {
                const compiler = require('./compiler');
                compiler.loadLocale(lang.code);
                const range = document.getWordRangeAtPosition(position);
                if (!range)
                    return;
                const word = document.getText(range);
                const cssProperty = compiler.cssMap[word];
                if (cssProperty) {
                    const markdown = new vscode.MarkdownString();
                    markdown.appendMarkdown(`**${word}** → \`${cssProperty}\`\n\n`);
                    // Add descriptions for common CSS properties
                    const descriptions = {
                        'color': 'Sets the text color',
                        'background-color': 'Sets the background color',
                        'font-size': 'Sets the font size',
                        'margin': 'Sets the outer spacing',
                        'padding': 'Sets the inner spacing',
                        'border': 'Sets the border style',
                        'width': 'Sets the element width',
                        'height': 'Sets the element height',
                        'display': 'Sets the display type',
                        'position': 'Sets the positioning method'
                    };
                    if (descriptions[cssProperty]) {
                        markdown.appendMarkdown(`*${descriptions[cssProperty]}*`);
                    }
                    return new vscode.Hover(markdown);
                }
                return undefined;
            }
        });
        context.subscriptions.push(cssHoverProvider);
    });
    // 5c. Code Actions - Quick Fix for English Tags
    languages_1.finalSupportedLanguages.forEach(lang => {
        const codeActionProvider = vscode.languages.registerCodeActionsProvider(lang.id, {
            provideCodeActions(document, range) {
                const compiler = require('./compiler');
                compiler.loadLocale(lang.code);
                // Create reverse map (english -> native)
                const reverseMap = {};
                for (const [native, eng] of Object.entries(compiler.htmlMap)) {
                    reverseMap[eng] = native;
                }
                const line = document.lineAt(range.start.line);
                const actions = [];
                // Check for English tags
                const tagRegex = /<\/?(\w+)/g;
                let match;
                while ((match = tagRegex.exec(line.text)) !== null) {
                    const englishTag = match[1];
                    const nativeTag = reverseMap[englishTag];
                    if (nativeTag && englishTag !== nativeTag) {
                        const action = new vscode.CodeAction(`Convert to <${nativeTag}>`, vscode.CodeActionKind.QuickFix);
                        action.edit = new vscode.WorkspaceEdit();
                        const fullText = document.getText();
                        const converted = fullText.replace(new RegExp(`<(\/?)${englishTag}([ >])`, 'g'), `<$1${nativeTag}$2`);
                        action.edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), converted);
                        action.isPreferred = true;
                        actions.push(action);
                    }
                }
                return actions;
            }
        }, {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        });
        context.subscriptions.push(codeActionProvider);
    });
    // 5c2. Code Actions for CSS
    languages_1.finalSupportedLanguages.forEach(lang => {
        const cssCodeActionProvider = vscode.languages.registerCodeActionsProvider(lang.cssId, {
            provideCodeActions(document, range) {
                const compiler = require('./compiler');
                compiler.loadLocale(lang.code);
                // Create reverse map (english -> native)
                const reverseMap = {};
                for (const [native, eng] of Object.entries(compiler.cssMap)) {
                    reverseMap[eng] = native;
                }
                const line = document.lineAt(range.start.line);
                const actions = [];
                // Check for English CSS properties
                const propRegex = /\b([\w-]+)\s*:/g;
                let match;
                while ((match = propRegex.exec(line.text)) !== null) {
                    const englishProp = match[1];
                    const nativeProp = reverseMap[englishProp];
                    if (nativeProp && englishProp !== nativeProp) {
                        const action = new vscode.CodeAction(`Convert to ${nativeProp}`, vscode.CodeActionKind.QuickFix);
                        action.edit = new vscode.WorkspaceEdit();
                        const fullText = document.getText();
                        const converted = fullText.replace(new RegExp(`\\b${englishProp}\\b`, 'g'), nativeProp);
                        action.edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), converted);
                        action.isPreferred = true;
                        actions.push(action);
                    }
                }
                return actions;
            }
        }, {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        });
        context.subscriptions.push(cssCodeActionProvider);
    });
    // 5d. Document Formatter - Auto-indent
    languages_1.finalSupportedLanguages.forEach(lang => {
        const formatter = vscode.languages.registerDocumentFormattingEditProvider(lang.id, {
            provideDocumentFormattingEdits(document) {
                const text = document.getText();
                let formatted = '';
                let indent = 0;
                const indentSize = 2;
                const lines = text.split('\n');
                for (let line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) {
                        formatted += '\n';
                        continue;
                    }
                    // Check if this is a closing tag - decrease indent BEFORE adding line
                    if (trimmed.startsWith('</')) {
                        indent = Math.max(0, indent - indentSize);
                    }
                    // Add the indented line
                    formatted += ' '.repeat(indent) + trimmed + '\n';
                    // Check if this is an opening tag - increase indent AFTER adding line
                    if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
                        // Don't increase for self-closing tags or tags that close on same line
                        if (!trimmed.endsWith('/>') && !trimmed.includes('</')) {
                            // Extract tag name to check if it closes on same line
                            const tagMatch = trimmed.match(/<(\S+)/);
                            if (tagMatch) {
                                const tagName = tagMatch[1];
                                // Only increase indent if tag doesn't close on same line
                                if (!trimmed.includes(`</${tagName}>`)) {
                                    indent += indentSize;
                                }
                            }
                        }
                    }
                }
                const fullRange = new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
                return [vscode.TextEdit.replace(fullRange, formatted.trimEnd())];
            }
        });
        context.subscriptions.push(formatter);
    });
    // 5e. Emmet-Style Abbreviations
    languages_1.finalSupportedLanguages.forEach(lang => {
        const emmetProvider = vscode.languages.registerCompletionItemProvider(lang.id, {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                // Check if line contains emmet-like pattern (e.g., "page>head>title")
                const emmetPattern = /(\w+)(>(\w+))+$/;
                const match = linePrefix.match(emmetPattern);
                if (!match)
                    return undefined;
                const compiler = require('./compiler');
                compiler.loadLocale(lang.code);
                // Create reverse map (english -> native)
                const reverseMap = {};
                for (const [native, eng] of Object.entries(compiler.htmlMap)) {
                    reverseMap[eng] = native;
                }
                // Add common aliases for better UX
                const aliases = {
                    'page': reverseMap['html'] || 'html',
                    'para': reverseMap['p'] || 'p',
                    'btn': reverseMap['button'] || 'button',
                    'heading': reverseMap['h1'] || 'h1',
                    'heading1': reverseMap['h1'] || 'h1',
                    'heading2': reverseMap['h2'] || 'h2',
                    'heading3': reverseMap['h3'] || 'h3'
                };
                // Merge aliases into reverse map
                Object.assign(reverseMap, aliases);
                // Parse the abbreviation
                const abbr = match[0];
                const tags = abbr.split('>');
                // Generate nested HTML
                let html = '';
                let indent = 0;
                const indentSize = 2;
                // Opening tags
                for (let i = 0; i < tags.length; i++) {
                    const englishTag = tags[i];
                    const nativeTag = reverseMap[englishTag] || englishTag;
                    html += ' '.repeat(indent) + `<${nativeTag}>`;
                    if (i < tags.length - 1) {
                        html += '\n';
                        indent += indentSize;
                    }
                }
                // Cursor position in the innermost tag
                html += '$0';
                // Closing tags in reverse
                for (let i = tags.length - 1; i >= 0; i--) {
                    const englishTag = tags[i];
                    const nativeTag = reverseMap[englishTag] || englishTag;
                    if (i === tags.length - 1) {
                        html += `</${nativeTag}>`;
                    }
                    else {
                        indent -= indentSize;
                        html += '\n' + ' '.repeat(indent) + `</${nativeTag}>`;
                    }
                }
                const completionItem = new vscode.CompletionItem(abbr, vscode.CompletionItemKind.Snippet);
                completionItem.insertText = new vscode.SnippetString(html);
                completionItem.documentation = new vscode.MarkdownString(`Expand to nested ${lang.name} HTML structure`);
                completionItem.detail = 'Emmet-style expansion';
                // Important: Set the range to replace the abbreviation
                const startPos = new vscode.Position(position.line, position.character - abbr.length);
                completionItem.range = new vscode.Range(startPos, position);
                return [completionItem];
            }
        }, '>' // Trigger on '>'
        );
        context.subscriptions.push(emmetProvider);
    });
    // 5f. Color Picker for CSS
    const parseHexColor = (hex) => {
        const match = hex.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/);
        if (!match)
            return null;
        let hexValue = match[1];
        if (hexValue.length === 3) {
            hexValue = hexValue.split('').map(c => c + c).join('');
        }
        const r = parseInt(hexValue.substr(0, 2), 16) / 255;
        const g = parseInt(hexValue.substr(2, 2), 16) / 255;
        const b = parseInt(hexValue.substr(4, 2), 16) / 255;
        return new vscode.Color(r, g, b, 1);
    };
    languages_1.finalSupportedLanguages.forEach(lang => {
        const colorProvider = vscode.languages.registerColorProvider(lang.cssId, {
            provideDocumentColors(document) {
                const text = document.getText();
                const colors = [];
                // Match hex colors
                const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
                let match;
                while ((match = hexRegex.exec(text)) !== null) {
                    const color = parseHexColor(match[0]);
                    if (color) {
                        const startPos = document.positionAt(match.index);
                        const endPos = document.positionAt(match.index + match[0].length);
                        colors.push(new vscode.ColorInformation(new vscode.Range(startPos, endPos), color));
                    }
                }
                // Match rgb/rgba
                const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g;
                while ((match = rgbRegex.exec(text)) !== null) {
                    const r = parseInt(match[1]) / 255;
                    const g = parseInt(match[2]) / 255;
                    const b = parseInt(match[3]) / 255;
                    const a = match[4] ? parseFloat(match[4]) : 1;
                    const startPos = document.positionAt(match.index);
                    const endPos = document.positionAt(match.index + match[0].length);
                    colors.push(new vscode.ColorInformation(new vscode.Range(startPos, endPos), new vscode.Color(r, g, b, a)));
                }
                return colors;
            },
            provideColorPresentations(color) {
                const r = Math.round(color.red * 255);
                const g = Math.round(color.green * 255);
                const b = Math.round(color.blue * 255);
                const a = color.alpha;
                const presentations = [];
                // Hex
                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                presentations.push(new vscode.ColorPresentation(hex));
                // RGB
                if (a === 1) {
                    presentations.push(new vscode.ColorPresentation(`rgb(${r}, ${g}, ${b})`));
                }
                else {
                    presentations.push(new vscode.ColorPresentation(`rgba(${r}, ${g}, ${b}, ${a})`));
                }
                return presentations;
            }
        });
        context.subscriptions.push(colorProvider);
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
    // 7. Auto-Import CSS - Suggest creating CSS file
    const createCssWatcher = vscode.workspace.onDidCreateFiles((event) => __awaiter(this, void 0, void 0, function* () {
        for (const file of event.files) {
            const langConfig = (0, languages_1.getLanguageFromExt)(file.fsPath);
            if (langConfig && file.fsPath.endsWith(langConfig.htmlExt)) {
                const dir = path.dirname(file.fsPath);
                const baseName = path.basename(file.fsPath, langConfig.htmlExt);
                const cssPath = path.join(dir, `${baseName}${langConfig.cssExt}`);
                // Check if CSS file already exists
                try {
                    yield vscode.workspace.fs.stat(vscode.Uri.file(cssPath));
                }
                catch (_a) {
                    // CSS doesn't exist, prompt user
                    const answer = yield vscode.window.showInformationMessage(`Create matching ${langConfig.name} CSS file?`, 'Yes', 'No');
                    if (answer === 'Yes') {
                        const compiler = require('./compiler');
                        compiler.loadLocale(langConfig.code);
                        const cssTemplate = `/* ${langConfig.name} CSS */\n\n${Object.keys(compiler.htmlMap)[3] || 'body'} {\n  ${Object.keys(compiler.cssMap)[1] || 'background-color'}: #f0f0f0;\n}\n`;
                        yield vscode.workspace.fs.writeFile(vscode.Uri.file(cssPath), Buffer.from(cssTemplate, 'utf8'));
                        vscode.window.showInformationMessage(`Created ${path.basename(cssPath)}`);
                    }
                }
            }
        }
    }));
    context.subscriptions.push(createCssWatcher);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map