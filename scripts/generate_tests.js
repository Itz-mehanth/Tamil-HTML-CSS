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
const testsDir = path.join(rootDir, 'tests');

if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir);
}

// Basic Templates (using Tamil/Placeholder keywords for now as we don't have translations)
const htmlTemplate = (langName, cssExt) => `<பக்கம்>
  <தலை>
    <தலைப்பு>${langName} Demo</தலைப்பு>
    <link href="./style${cssExt}" rel="stylesheet" />
  </தலை>
  <உடல்>
    <தலைப்பு1>Namaste from ${langName}!</தலைப்பு1>
    <பத்தி>This is a sample ${langName} HTML file.</பத்தி>
    <பொத்தான்>Click Me</பொத்தான்>
  </உடல்>
</பக்கம்>`;

const cssTemplate = (langName) => `தலைப்பு1 {
  நிறம்: சிவப்பு;
  எழுத்து-அளவு: 50px;
  எழுத்து-சீரமைப்பு: மையம்;
}

பத்தி {
  நிறம்: நீலம்;
  எழுத்து-அளவு: 20px;
}

உடல் {
  பின்னணி-நிறம்: #f0f0f0;
}`;

languages.forEach(lang => {
    const langTestsDir = path.join(testsDir, lang.name.toLowerCase());
    
    if (!fs.existsSync(langTestsDir)) {
        fs.mkdirSync(langTestsDir);
        console.log(`Created test directory for ${lang.name}`);
    }

    // HTML File
    const htmlPath = path.join(langTestsDir, `demo${lang.htmlExt}`);
    if (!fs.existsSync(htmlPath)) {
        fs.writeFileSync(htmlPath, htmlTemplate(lang.name, lang.cssExt));
    }

    // CSS File
    const cssPath = path.join(langTestsDir, `style${lang.cssExt}`);
    if (!fs.existsSync(cssPath)) {
        fs.writeFileSync(cssPath, cssTemplate(lang.name));
    }
});

console.log("Test files generated for all languages.");
