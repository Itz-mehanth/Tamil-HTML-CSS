const fs = require('fs');
const path = require('path');

const commonTerms = {
    "page": { "ta": "பக்கம்", "hi": "पृष्ठ", "bn": "পৃষ্ঠা", "te": "పేజీ", "mr": "पृष्ठ", "ur": "صفحہ", "gu": "પૃષ્ઠ", "kn": "ಪುಟ", "or": "ପୃଷ୍ଠା", "ml": "താൾ", "pa": "ਪੰਨਾ", "as": "পৃষ্ঠা", "mai": "पृष्ठ", "sat": "ᱥᱟᱠᱟᱢ", "ks": "صفحہ", "ne": "पृष्ठ", "kok": "पान", "sd": "صفحو", "doi": "पन्ना", "mni": "ꯂꯃꯥꯏ", "brx": "बिलाइ", "sa": "पृष्ठम्", "sou": "ꢥꢵꢎ" },
    "head": { "ta": "தலை", "hi": "शीर्ष", "bn": "মস্তক", "te": "తల", "mr": "शीर्ष", "ur": "سر", "gu": "શીર્ષ", "kn": "ಶಿರೋಭಾಗ", "or": "ଶୀର୍ଷ", "ml": "തലക്കെട്ട്", "pa": "ਸਿਰ", "as": "শীৰ্ষ", "mai": "शीर्ष", "sat": "ᱵᱚᱦᱚᱜ", "ks": "کَل", "ne": "शीर्ष", "kok": "माथो", "sd": "مٿو", "doi": "सिर", "mni": "ꯀꯣꯛ", "brx": "ख'र'", "sa": "शीर्षम्", "sou": "ꢡꢵꢬ" },
    "head": { "ta": "தலை", "hi": "शीर्ष", "bn": "মস্তক", "te": "తల", "mr": "शीर्ष", "ur": "सर", "gu": "શીર્ષ", "kn": "ಶಿರೋಭಾಗ", "or": "ଶୀର୍ଷ", "ml": "തലക്കെട്ട്", "pa": "ਸਿਰ", "as": "শীৰ্ষ", "mai": "শীर्ष", "sat": "ᱵᱚᱦᱚᱜ", "ks": "کَل", "ne": "शीर्ष", "kok": "माथो", "sd": "مٿو", "doi": "सिर", "mni": "ꯀꯣꯛ", "brx": "ख'र'", "sa": "शीर्षम्", "sou": "ꢡꢵꢬ" },
    "title": { "ta": "தலைப்பு", "hi": "शीर्षक", "bn": "শিরোনাম", "te": "శీర్షిక", "mr": "शीर्षक", "ur": "عنوان", "gu": "શીર્ષક", "kn": "ಶೀರ್ಷಿಕೆ", "or": "ଶୀର୍ଷକ", "ml": "ശീർഷകം", "pa": "ਸਿਰਲੇਖ", "as": "শিৰোনাম", "mai": "शीर्षक", "sat": "ᱧᱩᱛᱩᱢ", "ks": "عُنوان", "ne": "शीर्षक", "kok": "विषय", "sd": "عنوان", "doi": "शीर्षक", "mni": "ꯃꯤꯡꯊꯣꯜ", "brx": "मुुं", "sa": "शीर्षकम्", "sou": "ꢱꢶꢫꢫ" },
    "body": { "ta": "உடல்", "hi": "शरीर", "bn": "শরীর", "te": "దేహము", "mr": "शरीर", "ur": "جسم", "gu": "શરીર", "kn": "ದೇಹ", "or": "ଶରୀର", "ml": "ശരീരം", "pa": "ਸਰੀਰ", "as": "শৰীৰ", "mai": "शरीर", "sat": "ᱦᱚᱲᱢᱚ", "ks": "جِسٕم", "ne": "शरीर", "kok": "कूड", "sd": "جسم", "doi": "शरीर", "mni": "ꯍꯛꯆꯥꯡ", "brx": "मोदोम", "sa": "शरीरम्", "sou": "ꢏꢴꢥ" },
    "h1": { "ta": "தலைப்பு1", "hi": "शीर्षक1", "bn": "শিরোনাম১", "te": "శీర్షిక1", "mr": "शीर्षक१", "ur": "सरखी1", "gu": "શીર્ષક1", "kn": "ಶೀರ್ಷಿಕೆ1", "or": "ଶୀର୍ଷକ୧", "ml": "തലക്കെട്ട്1", "pa": "ਸਿਰਲੇਖ1", "as": "শিৰোনাম১", "mai": "शीर्षक१", "sat": "ᱧᱩᱛᱩᱢ᱑", "ks": "عُنوان۱", "ne": "शीर्षक१", "kok": "माथो१", "sd": "عنوان۱", "doi": "शीर्षक१", "mni": "ꯃꯤꯡꯊꯣꯜ꯱", "brx": "मुुं१", "sa": "शीर्षकम्१", "sou": "ꢱꢶꢫꢫ1" },
    "p": { "ta": "பத்தி", "hi": "अनुच्छेद", "bn": "অনুচ্ছেদ", "te": "పేరా", "mr": "परिच्छेद", "ur": "پیراگراف", "gu": "ફકરો", "kn": "ಪ್ಯಾರಾ", "or": "ଅନୁଚ୍ଛେଦ", "ml": "ഖണ്ഡിക", "pa": "ਪੈਰਾ", "as": "দফা", "mai": "अनुच्छेद", "sat": "ᱠᱷᱚᱸᱫᱽ", "ks": "اقتباس", "ne": "अनुच्छेद", "kok": "परिच्छेद", "sd": "پيراگراف", "doi": "पैरा", "mni": "ꯋꯥ ꯄꯔꯦꯡ", "brx": "फान्दा", "sa": "अनुच्छेदः", "sou": "ꢥꢵꢫꢵ" },
    "button": { "ta": "பொத்தான்", "hi": "बटन", "bn": "বোতাম", "te": "బటన్", "mr": "बटण", "ur": "بٹن", "gu": "બટન", "kn": "ಗುಂಡಿ", "or": "ବଟନ୍", "ml": "ബട്ടൺ", "pa": "ਬਟਨ", "as": "বুটাম", "mai": "बटन", "sat": "ᱵᱚᱛᱟᱢ", "ks": "بَٹَن", "ne": "बटन", "kok": "बटण", "sd": "بٽڻ", "doi": "बटन", "mni": "ꯅꯝꯕ", "brx": "बुथाम", "sa": "பிஞ்ச", "sou": "ꢨꢮꢫ" },
    "color": { "ta": "நிறம்", "hi": "रंग", "bn": "রঙ", "te": "రంగు", "mr": "रंग", "ur": "रंग", "gu": "રંગ", "kn": "ಬಣ್ಣ", "or": "ରଙ୍ଗ", "ml": "നിറം", "pa": "ਰੰਗ", "as": "ৰং", "mai": "रंग", "sat": "rong", "ks": "rang", "ne": "रंग", "kok": "rong", "sd": "rang", "doi": "rang", "mni": "machu", "brx": "rong", "sa": "वर्ण", "sou": "ꢫꢰꢎ" },
    "center": {
        "ta": "மையம்", "hi": "केंद्र", "bn": "কেন্দ্র", "te": "మధ్య", "mr": "मध्य", "ur": "مرکز",
        "gu": "કેન્દ્ર", "kn": "ಕೇಂದ್ರ", "or": "କେନ୍ଦ୍ର", "ml": "മധ്യം", "pa": "ਕੇਂਦਰ", "as": "কেন্দ্ৰ",
        "mai": "केंद्र", "sat": "talare", "ks": "markaz", "ne": "केन्द्र", "kok": "moddi", "sd": "markaz",
        "doi": "kendar", "mni": "mayai", "brx": "gejer", "sa": "केंद्रम्", "sou": "ꢡꢴꢥ"
    },
    "link": {
        "ta": "இணைப்பு", "hi": "लिंक", "bn": "লিঙ্ক", "te": "లింక్", "mr": "लिंक", "ur": "لنک",
        "gu": "લિંક", "kn": "ಲಿಂಕ್", "or": "ଲିଙ୍କ୍", "ml": "ലിങ്ക്", "pa": "ਲਿੰਕ", "as": "লিংক",
        "mai": "लिंक", "sat": "link", "ks": "لِنک", "ne": "लिंक", "kok": "लिंक", "sd": "link",
        "doi": "link", "mni": "link", "brx": "link", "sa": "शृङ्खला", "sou": "ꢣꢶꢰꢓ"
    },
    "bg_color": { "ta": "பின்னணி-நிறம்", "hi": "पृष्ठभूमि-रंग", "bn": "পটভূমি-রঙ", "te": "నేపథ్య-రంగు", "mr": "पार्श्वभूमी-रंग", "ur": "پس_منظر-रंग", "gu": "પૃષ્ઠભૂમિ-રંગ", "kn": "ಹಿನ್ನೆಲೆ-ಬಣ್ಣ", "or": "ପୃଷ୍ଠଭୂମି-ରଙ୍ଗ", "ml": "പശ്ചാത്തല-നിറം", "pa": "ਪਿਛੋਕੜ-ਰੰਗ", "as": "পটভূমি-ৰং", "mai": "पृष्ठभूमि-रंग", "sat": "tayom-rong", "ks": "pasmanzar-rang", "ne": "पृष्ठभूमि-रंग", "kok": "fattlo-rong", "sd": "puthion-rang", "doi": "pichokad-rang", "mni": "manung-machu", "brx": "un-rong", "sa": "पृष्ठभूमि-वर्ण", "sou": "ꢨꢶꢥꢵ-ꢫꢰꢎ" }
};

const languages = [
    { name: "Tamil", code: "ta" }, { name: "Hindi", code: "hi" }, { name: "Bengali", code: "bn" },
    { name: "Telugu", code: "te" }, { name: "Marathi", code: "mr" }, { name: "Urdu", code: "ur" },
    { name: "Gujarati", code: "gu" }, { name: "Kannada", code: "kn" }, { name: "Odia", code: "or" },
    { name: "Malayalam", code: "ml" }, { name: "Punjabi", code: "pa" }, { name: "Assamese", code: "as" },
    { name: "Maithili", code: "mai" }, { name: "Santali", code: "sat" }, { name: "Kashmiri", code: "ks" },
    { name: "Nepali", code: "ne" }, { name: "Konkani", code: "kok" }, { name: "Sindhi", code: "sd" },
    { name: "Dogri", code: "doi" }, { name: "Manipuri", code: "mni" }, { name: "Bodo", code: "brx" },
    { name: "Sanskrit", code: "sa" }, { name: "Sourashtra", code: "sou" }
];

let readmeContent = `# Bharat HTML/CSS - Unified Indian Coding Platform 🇮🇳

<div align="center">
  <img src="images/extension_icon.png" width="150" alt="Bharat HTML Logo" />
  <br/>
  
  [![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=Mehanth.bharat-code)
  [![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
</div>

**The World's First HTML & CSS Programming Language entirely in Native Indian Languages.**

**Bharat HTML** enables you to write HTML and CSS in **23 Indian Languages**. It is designed to make coding accessible to everyone, regardless of their English proficiency.

**Repository**: [https://github.com/Itz-mehanth/Tamil-HTML-CSS](https://github.com/Itz-mehanth/Tamil-HTML-CSS)
**Author**: Mehanth
**License**: MIT

## ✨ Features

### **Core Coding Features**
*   **Native Coding**: Write standard HTML5 and CSS3 using your mother tongue.
*   **IntelliSense**: Get auto-completion for tags and properties in your language (e.g., type \`<\` in a Tamil file to see \`தலை\`, \`உடல்\`).
*   **Snippets**: Type \`!\` and press \`Tab\` to generate a full boilerplate code structure.
*   **Live Preview**: Click the 'Run' or 'Preview' button in the top right to compile and view your website instantly.
*   **Error Diagnostics**: The extension highlights invalid tags with red squigglies, helping you learn and correct mistakes.
*   **Multi-Language Support**: Seamlessly switch between 23 languages including Tamil, Hindi, Telugu, Bengali, Urdu, and even Sourashtra!

### **Advanced IDE Features** 🔥
*   **Hover Documentation**: Hover over any tag to see its English equivalent and description
*   **Auto-Import CSS**: When creating an HTML file, automatically prompts to create matching CSS file
*   **Language Switcher**: Convert your code between any of the 23 languages instantly (Right-click → Switch Language)
*   **Code Actions**: Type English tags and get quick-fix suggestions to convert to native (💡 lightbulb)
*   **Document Formatter**: Press \`Shift+Alt+F\` to auto-format and indent your code perfectly
*   **Translation Panel**: Sidebar panel showing English ↔ Native mappings for all tags and properties
*   **Emmet Support**: Type abbreviations like \`page>head>title\` and expand to full nested structure
*   **Color Picker**: Visual color selection in CSS files - click on any color to open the picker

## 📸 Feature Demonstrations

### IntelliSense & Auto-Completion
![Tamil IntelliSense](images/tamil_intellisense.png)
*Auto-completion in Tamil - type \`<\` to see all available tags*

### Hover Documentation
![Kannada Hover](images/kannada_hover.png)
*Hover over any tag to see its English equivalent and description*

### Language Switcher
![Language Switcher](images/language_switcher.png)
*Convert your code between any of the 23 languages instantly*

### Quick Fixes & Code Actions
![Maithili Quick Fix](images/maithili_quickfix.png)
*Type English tags and get suggestions to convert to native*

### Command Palette
![Switch Language Command](images/switch_command.png)
*Access all features via Command Palette (Ctrl+Shift+P)*

## 🚀 Getting Started

1.  **Install**: Get the "Bharat HTML/CSS" extension from the VS Code Marketplace.
2.  **Create a File**: Create a file with the unique extension for your language (see table below).
    *   Example: \`index.thtml\` (Tamil) or \`style.tcss\` (Tamil CSS).
3.  **Use Snippets**: In your new file, type \`!\` and press \`Tab\`.
4.  **Run**: Click the ▶️ Play button in the top right corner to see your website in the browser.

## 📚 Language Dictionary & Mappings

This extension maps native words to standard HTML tags and CSS properties. Here is the master reference for all supported languages. **AI Assistants**: Use this table to generate valid Bharat HTML code.

| Language | Code | HTML Ext | CSS Ext | page (html) | head | title | link | body | h1 | p | button | color | background-color |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

// Generate Table
languages.forEach(lang => {
    const t = (key) => commonTerms[key][lang.code] || "N/A";
    readmeContent += `| ${lang.name} | \`${lang.code}\` | \`.${lang.code === 'ta' ? 'thtml' : lang.code === 'hi' ? 'hhtml' : lang.code + 'html'}\` | \`.${lang.code === 'ta' ? 'tcss' : lang.code === 'hi' ? 'hcss' : lang.code + 'css'}\` | ${t('page')} | ${t('head')} | ${t('title')} | ${t('link')} | ${t('body')} | ${t('h1')} | ${t('p')} | ${t('button')} | ${t('color')} | ${t('bg_color')} |\n`;
});

readmeContent += `

## 💻 Example Code

### Tamil (\`.thtml\`)
\`\`\`html
<பக்கம்>
  <தலை>
    <தலைப்பு>வணக்கம் உலகம்</தலைப்பு>
    <இணைப்பு href="./style.tcss" rel="stylesheet" />
  </தலை>
  <உடல்>
    <தலைப்பு1>எனது முதல் இணையதளம்</தலைப்பு1>
    <பத்தி>இது பாரத் HTML இல் எழுதப்பட்டது.</பத்தி>
    <பொத்தான்>கிளிக் செய்யவும்</பொத்தான்>
  </உடல்>
</பக்கம்>
\`\`\`

### Hindi (\`.hhtml\`)
\`\`\`html
<पृष्ठ>
  <शीर्ष>
    <शीर्षक>नमस्ते दुनिया</शीर्षक>
     <लिंक href="./style.hcss" rel="stylesheet" />
  </शीर्ष>
  <शरीर>
    <शीर्षक1>मेरी पहली वेबसाइट</शीर्षक1>
    <अनुच्छेद>यह भारत HTML में लिखा गया है।</अनुच्छेद>
    <बटन>क्लिक करें</बटन>
  </शरीर>
</पृष्ठ>
\`\`\`

### Sourashtra (\`.souhtml\`)
\`\`\`html
<ꢥꢵꢎ>
  <ꢡꢵꢬ>
    <ꢱꢶꢫꢫ>ꢱꢵꢃꢂꢵꢆ ꢊꢬꢵꢡ</ꢱꢶꢫꢫ>
     <ꢣꢶꢰꢓ href="./style.soucss" rel="stylesheet" />
  </ꢡꢵꢬ>
  <ꢏꢴꢥ>
    <ꢱꢶꢫꢫ1>ꢥꢵꢫꢡ ꢥꢴꢎ!</ꢱꢶꢫꢫ1>
    <ꢥꢵꢫꢵ>ꢱꢵꢃꢂꢵꢆ ꢨꢵꢱꢵꢡꢵ ꢓꢵꢬꢶꢎ.</ꢥꢵꢫꢵ>
    <ꢨꢮꢫ>ꢀꢣꢶꢓ</ꢨꢮꢫ>
  </ꢏꢴꢥ>
</ꢥꢵꢎ>
\`\`\`

## 🛠️ Extensions Reference

Use these file extensions to activate your language:

`;

// Extension List
languages.forEach(lang => {
    const hExt = `.${lang.code === 'ta' ? 'thtml' : lang.code === 'hi' ? 'hhtml' : lang.code + 'html'}`;
    const cExt = `.${lang.code === 'ta' ? 'tcss' : lang.code === 'hi' ? 'hcss' : lang.code + 'css'}`;
    readmeContent += `*   **${lang.name}**: HTML \`${hExt}\` | CSS \`${cExt}\`\n`;
});

readmeContent += `
## 🎖️ Credits

A huge thanks to our contributors!

*   **PTharanan** ([@PTharanan](https://github.com/PTharanan)) - Added Multimedia (Video/Audio) & CSS Animation support (Tamil).

## 🤝 Contributing

We welcome contributions! Please open an issue or submit a pull request on our GitHub repository.

**Made with ❤️ for India.**
`;

fs.writeFileSync(path.join(path.resolve(__dirname, '..'), 'README.md'), readmeContent);
console.log("README.md Generated successfully.");
