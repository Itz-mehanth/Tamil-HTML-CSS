const fs = require('fs');
const path = require('path');

const languages = [
    { name: "Tamil", code: "ta", htmlExt: ".thtml", cssExt: ".tcss" },
    { name: "Hindi", code: "hi", htmlExt: ".hhtml", cssExt: ".hcss" },
    { name: "Bengali", code: "bn", htmlExt: ".bhtml", cssExt: ".bcss" },
    { name: "Telugu", code: "te", htmlExt: ".tehtml", cssExt: ".tecss" },
    { name: "Marathi", code: "mr", htmlExt: ".mrhtml", cssExt: ".mrcss" },
    { name: "Urdu", code: "ur", htmlExt: ".uhtml", cssExt: ".ucss" },
    { name: "Gujarati", code: "gu", htmlExt: ".ghtml", cssExt: ".gcss" },
    { name: "Kannada", code: "kn", htmlExt: ".khtml", cssExt: ".kcss" },
    { name: "Odia", code: "or", htmlExt: ".ohtml", cssExt: ".ocss" },
    { name: "Malayalam", code: "ml", htmlExt: ".mhtml", cssExt: ".mcss" },
    { name: "Punjabi", code: "pa", htmlExt: ".phtml", cssExt: ".pcss" },
    { name: "Assamese", code: "as", htmlExt: ".ashtml", cssExt: ".ascss" },
    { name: "Maithili", code: "mai", htmlExt: ".maihtml", cssExt: ".maicss" },
    { name: "Santali", code: "sat", htmlExt: ".sathtml", cssExt: ".satcss" },
    { name: "Kashmiri", code: "ks", htmlExt: ".kshtml", cssExt: ".kscss" },
    { name: "Nepali", code: "ne", htmlExt: ".nhtml", cssExt: ".ncss" },
    { name: "Konkani", code: "kok", htmlExt: ".kohtml", cssExt: ".kocss" },
    { name: "Sindhi", code: "sd", htmlExt: ".sdhtml", cssExt: ".sdcss" },
    { name: "Dogri", code: "doi", htmlExt: ".dhtml", cssExt: ".dcss" },
    { name: "Manipuri", code: "mni", htmlExt: ".mnihtml", cssExt: ".mnicss" },
    { name: "Bodo", code: "brx", htmlExt: ".brxhtml", cssExt: ".brxcss" },
    { name: "Sanskrit", code: "sa", htmlExt: ".sahtml", cssExt: ".sacss" }
];

const rootDir = path.resolve(__dirname, '..');
const localesDir = path.join(rootDir, 'src', 'locales');
const syntaxesDir = path.join(rootDir, 'syntaxes');
const outputJson = path.join(rootDir, 'package_contributions.json');

// Templates
const localeTemplate = fs.readFileSync(path.join(localesDir, 'ta.ts'), 'utf8');
const htmlGrammarTemplate = fs.readFileSync(path.join(syntaxesDir, 'hhtml.tmLanguage.json'), 'utf8');
const cssGrammarTemplate = fs.readFileSync(path.join(syntaxesDir, 'hcss.tmLanguage.json'), 'utf8');

let packageLanguages = [];
let packageGrammars = [];
let packageSnippets = [];

languages.forEach(lang => {
    // 1. Generate Locale File if not exists
    const localePath = path.join(localesDir, `${lang.code}.ts`);
    if (!fs.existsSync(localePath)) {
        console.log(`Creating locale for ${lang.name}...`);
        fs.writeFileSync(localePath, localeTemplate);
    }

    // 2. Generate Grammars
    // HTML
    const htmlGrammarPath = path.join(syntaxesDir, `${lang.code}html.tmLanguage.json`);
    if (!fs.existsSync(htmlGrammarPath)) {
        console.log(`Creating HTML grammar for ${lang.name}...`);
        let content = htmlGrammarTemplate.replace(/source\.hhtml/g, `source.${lang.code}html`);
        // Replace regex parts if we had them mapped, but for now we keep the structure
        // Specifically replacing name captures to be language specific
        content = content.replace(/\.hhtml/g, `.${lang.code}html`);
        fs.writeFileSync(htmlGrammarPath, content);
    }

    // CSS
    const cssGrammarPath = path.join(syntaxesDir, `${lang.code}css.tmLanguage.json`);
    if (!fs.existsSync(cssGrammarPath)) {
        console.log(`Creating CSS grammar for ${lang.name}...`);
        let content = cssGrammarTemplate.replace(/source\.hcss/g, `source.${lang.code}css`);
        content = content.replace(/\.hcss/g, `.${lang.code}css`);
        fs.writeFileSync(cssGrammarPath, content);
    }

    // 3. Prepare Package JSON entries
    // Uses the folder structure created previously
    const iconFolder = lang.name.toLowerCase(); 
    
    // HTML Entry
    packageLanguages.push({
        id: `${lang.code}html`,
        aliases: [`${lang.name} HTML`, `${lang.code}html`],
        extensions: [lang.htmlExt],
        configuration: "./language-configuration.json",
        icon: {
            light: `./images/${iconFolder}/${lang.code}html_logo.png`,
            dark: `./images/${iconFolder}/${lang.code}html_logo.png`
        }
    });

    // CSS Entry
    packageLanguages.push({
        id: `${lang.code}css`,
        aliases: [`${lang.name} CSS`, `${lang.code}css`],
        extensions: [lang.cssExt],
        configuration: "./language-configuration.json",
        icon: {
            light: `./images/${iconFolder}/${lang.code}css_logo.png`,
            dark: `./images/${iconFolder}/${lang.code}css_logo.png`
        }
    });

    // Grammars
    packageGrammars.push({
        language: `${lang.code}html`,
        scopeName: `source.${lang.code}html`,
        path: `./syntaxes/${lang.code}html.tmLanguage.json`
    });
    packageGrammars.push({
        language: `${lang.code}css`,
        scopeName: `source.${lang.code}css`,
        path: `./syntaxes/${lang.code}css.tmLanguage.json`
    });
    // Snippets (only for HTML for now)
    const htmlLangId = lang.id || `${lang.code}html`;
    packageSnippets.push({
        language: htmlLangId,
        path: `./snippets/${htmlLangId}.json`
    });
});

// Output JSON for manual merge
const finalJson = {
    languages: packageLanguages,
    grammars: packageGrammars,
    snippets: packageSnippets
};

fs.writeFileSync(outputJson, JSON.stringify(finalJson, null, 2));
console.log(`Resources generated. JSON snippets written to ${outputJson}`);
