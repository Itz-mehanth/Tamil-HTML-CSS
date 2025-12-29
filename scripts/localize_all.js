const fs = require('fs');
const path = require('path');

const commonTerms = {
    // English Key: { code: translation }
    "page": {
        "ta": "பக்கம்", "hi": "पृष्ठ", "bn": "পৃষ্ঠা", "te": "పేజీ", "mr": "पृष्ठ", "ur": "صفحہ",
        "gu": "પૃષ્ઠ", "kn": "ಪುಟ", "or": "ପୃଷ୍ଠା", "ml": "താൾ", "pa": "ਪੰਨਾ", "as": "পৃষ্ঠা",
        "mai": "पृष्ठ", "sat": "ᱥᱟᱠᱟᱢ", "ks": "صفحہ", "ne": "पृष्ठ", "kok": "पान", "sd": "صفحو",
        "doi": "पन्ना", "mni": "ꯂꯃꯥꯏ", "brx": "बिलाइ", "sa": "पृष्ठम्", "sou": "ꢥꢵꢎ"
    },
    "head": {
        "ta": "தலை", "hi": "शीर्ष", "bn": "মস্তক", "te": "తల", "mr": "शीर्ष", "ur": "سر",
        "gu": "શીર્ષ", "kn": "ಶಿರೋಭಾಗ", "or": "ଶୀର୍ଷ", "ml": "തലക്കെട്ട്", "pa": "ਸਿਰ", "as": "শীৰ্ষ",
        "mai": "शीर्ष", "sat": "ᱵᱚᱦᱚᱜ", "ks": "کَل", "ne": "शीर्ष", "kok": "माथो", "sd": "مٿو",
        "doi": "सिर", "mni": "ꯀꯣꯛ", "brx": "ख'र'", "sa": "शीर्षम्", "sou": "ꢡꢵꢬ"
    },
    "title": {
        "ta": "தலைப்பு", "hi": "शीर्षक", "bn": "শিরোনাম", "te": "శీర్షిక", "mr": "शीर्षक", "ur": "عنوان",
        "gu": "શીર્ષક", "kn": "ಶೀರ್ಷಿಕೆ", "or": "ଶୀର୍ଷକ", "ml": "ശീർഷകം", "pa": "ਸਿਰਲੇਖ", "as": "শিৰোনাম",
        "mai": "शीर्षक", "sat": "ᱧᱩᱛᱩᱢ", "ks": "عُنوان", "ne": "शीर्षक", "kok": "विषय", "sd": "unwan",
        "doi": "शीर्षक", "mni": "ꯃꯤꯡꯊꯣꯜ", "brx": "मुुं", "sa": "शीर्षकम्", "sou": "ꢱꢶꢫꢫ"
    },
    "body": {
        "ta": "உடல்", "hi": "शरीर", "bn": "শরীর", "te": "దేహము", "mr": "शरीर", "ur": "جسم",
        "gu": "શરીર", "kn": "ದೇಹ", "or": "ଶରୀର", "ml": "ശരീരം", "pa": "ਸਰੀਰ", "as": "শৰীৰ",
        "mai": "शरीर", "sat": "ᱦᱚᱲᱢᱚ", "ks": "جِسٕم", "ne": "शरीर", "kok": "कूड", "sd": "jism",
        "doi": "शरीर", "mni": "ꯍꯛꯆꯥꯡ", "brx": "मोदोम", "sa": "शरीरम्", "sou": "ꢏꢴꢥ"
    },
    "h1": {
        "ta": "தலைப்பு1", "hi": "शीर्षक1", "bn": "শিরোনাম১", "te": "శీర్షిక1", "mr": "शीर्षक१", "ur": "سرخی1",
        "gu": "શીર્ષક1", "kn": "ಶೀರ್ಷಿಕೆ1", "or": "ଶୀର୍ଷକ୧", "ml": "തലക്കെട്ട്1", "pa": "ਸਿਰਲੇਖ1", "as": "শিৰোনাম১",
        "mai": "शीर्षक१", "sat": "ᱧᱩᱛᱩᱢ᱑", "ks": "عُنوان۱", "ne": "शीर्षक१", "kok": "माथो१", "sd": "عنوان١",
        "doi": "शीर्षक१", "mni": "ꯃꯤꯡꯊꯣꯜ꯱", "brx": "मुुं१", "sa": "शीर्षकम्१", "sou": "ꢱꢶꢫꢫ1"
    },
    "p": {
        "ta": "பத்தி", "hi": "अनुच्छेद", "bn": "অনুচ্ছেদ", "te": "పేరా", "mr": "परिच्छेद", "ur": "پیراگراف",
        "gu": "ફકરો", "kn": "ಪ್ಯಾರಾ", "or": "ଅନୁଚ୍ଛେଦ", "ml": "ഖണ്ഡിക", "pa": "ਪੈਰਾ", "as": "দফা",
        "mai": "अनुच्छेद", "sat": "ᱠᱷᱚᱸᱫᱽ", "ks": "اقتباس", "ne": "अनुच्छेद", "kok": "परिच्छेद", "sd": "پيراگراف",
        "doi": "पैरा", "mni": "ꯋꯥ ꯄꯔꯦꯡ", "brx": "फान्दा", "sa": "अनुच्छेदः", "sou": "ꢥꢵꢫꢵ"
    },
    "button": {
        "ta": "பொத்தான்", "hi": "बटन", "bn": "বোতাম", "te": "బటన్", "mr": "बटण", "ur": "بٹن",
        "gu": "બટન", "kn": "ಗುಂಡಿ", "or": "ବଟନ୍", "ml": "ബട്ടൺ", "pa": "ਬਟਨ", "as": "বুটাম",
        "mai": "बटन", "sat": "ᱵᱚᱛᱟᱢ", "ks": "بَٹَن", "ne": "बटन", "kok": "बटण", "sd": "بٽڻ",
        "doi": "boton", "mni": "ꯅꯝꯕ", "brx": "बुथाम", "sa": "பிஞ்ச", "sou": "ꢨꢮꢫ"
    },
    // CSS
    "color": {
        "ta": "நிறம்", "hi": "रंग", "bn": "রঙ", "te": "రంగు", "mr": "रंग", "ur": "رنگ",
        "gu": "રંગ", "kn": "ಬಣ್ಣ", "or": "ରଙ୍ଗ", "ml": "നിറം", "pa": "ਰੰਗ", "as": "ৰং",
        "mai": "रंग", "sat": "rong", "ks": "rang", "ne": "रंग", "kok": "rong", "sd": "rang",
        "doi": "rang", "mni": "machu", "brx": "rong", "sa": "वर्ण", "sou": "ꢫꢰꢎ"
    },
    "bg_color": {
        "ta": "பின்னணி-நிறம்", "hi": "पृष्ठभूमि-रंग", "bn": "পটভূমি-রঙ", "te": "నేపథ్య-రంగు", "mr": "पार्श्वभूमी-रंग", "ur": "پس_منظر-رنگ",
        "gu": "પૃષ્ઠભૂમિ-રંગ", "kn": "ಹಿನ್ನೆಲೆ-ಬಣ್ಣ", "or": "ପୃଷ୍ଠଭୂମି-ରଙ୍ଗ", "ml": "പശ്ചാത്തല-നിറം", "pa": "ਪਿਛੋਕੜ-ਰੰਗ", "as": "পটভূমি-ৰং",
        "mai": "पृष्ठभूमि-रंग", "sat": "tayom-rong", "ks": "pasmanzar-rang", "ne": "पृष्ठभूमि-रंग", "kok": "fattlo-rong", "sd": "puthion-rang",
        "doi": "pichokad-rang", "mni": "manung-machu", "brx": "un-rong", "sa": "पृष्ठभूमि-वर्ण", "sou": "ꢨꢶꢥꢵ-ꢫꢰꢎ"
    },
    "font_size": {
        "ta": "எழுத்து-அளவு", "hi": "फ़ॉन्ट-आकार", "bn": "ফন্ট-আকার", "te": "ఫాంట్-పరిమాణం", "mr": "फॉन्ट-आकार", "ur": "فونٹ-سائز",
        "gu": "ફોન્ટ-કદ", "kn": "ಅಕ್ಷರ-ಗಾತ್ರ", "or": "ଅକ୍ଷର-ଆକାର", "ml": "അക്ഷര-വലിപ്പം", "pa": "ਫੌਂਟ-ਆਕਾਰ", "as": "ফন্ট-আকাৰ",
        "mai": "अक्षर-आकार", "sat": "ol-map", "ks": "font-saiz", "ne": "अक्षर-आकार", "kok": "akshar-map", "sd": "font-saiz",
        "doi": "font-akar", "mni": "mayek-size", "brx": "hwrwb-maf", "sa": "ಅಕ್ಷರ-परिमाण", "sou": "ꢀꢴꢬꢫ-ꢱꢴꢎ"
    },
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
    }
};

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
    { name: "Punjabi", code: "pa", htmlExt: ".pahtml", cssExt: ".pacss" },
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
    { name: "Sanskrit", code: "sa", htmlExt: ".sahtml", cssExt: ".sacss" },
    { name: "Sourashtra", code: "sou", htmlExt: ".souhtml", cssExt: ".soucss" }
];

const rootDir = path.resolve(__dirname, '..');
const localesDir = path.join(rootDir, 'src', 'locales');
const testsDir = path.join(rootDir, 'tests');

languages.forEach(lang => {
    // 1. Update Locale File
    const localePath = path.join(localesDir, `${lang.code}.ts`);
    let localeContent = "";

    // Generate valid mappings
    const t = (key) => commonTerms[key][lang.code] || commonTerms[key]['ta']; // Fallback to Tamil if missing in my mini-dict

    // We build a simplified locale file that EXPORTS what compile.ts needs
    // We can't do a full file but we can replace the placeholders if we read the template
    // Actually, let's just create a functional partial file that works for the demo
    
    // Construct the map content
    const htmlMapContent = `
  "${t('page')}": "html",
  "${t('head')}": "head",
  "${t('title')}": "title",
  "${t('body')}": "body",
  "${t('h1')}": "h1",
  "${t('p')}": "p",
  "${t('button')}": "button",
  "${t('link')}": "link",
`;

    const cssMapContent = `
  "${t('color')}": "color",
  "${t('bg_color')}": "background-color",
  "${t('font_size')}": "font-size",
  "${t('center')}": "center",
  // Fallbacks for colors (English/Common)
  "red": "red", "blue": "blue", "#f0f0f0": "#f0f0f0",
`;

    const fullFileContent = `export const htmlMap: Record<string, string> = {
${htmlMapContent}
};

export const cssMap: Record<string, string> = {
${cssMapContent}
};
`;
    // Write locale file (Overwrite existing placeholder)
    fs.writeFileSync(localePath, fullFileContent);


    // 2. Update Test Files
    const langTestsDir = path.join(testsDir, lang.name.toLowerCase());
    if (!fs.existsSync(langTestsDir)) fs.mkdirSync(langTestsDir, {recursive: true});

    const htmlContent = `<${t('page')}>
  <${t('head')}>
    <${t('title')}>${lang.name} Demo</${t('title')}>
    <${t('link')} href="./style${lang.cssExt}" rel="stylesheet" />
  </${t('head')}>
  <${t('body')}>
    <${t('h1')}>Namaste ${lang.name}!</${t('h1')}>
    <${t('p')}>Built with Bharat HTML.</${t('p')}>
    <${t('button')}>Click</${t('button')}>
  </${t('body')}>
</${t('page')}>`;

    const cssContent = `${t('h1')} {
  ${t('color')}: red;
  ${t('font_size')}: 50px;
  text-align: ${t('center')};
}

${t('body')} {
  ${t('bg_color')}: #f0f0f0;
}`;

    fs.writeFileSync(path.join(langTestsDir, `demo${lang.htmlExt}`), htmlContent);
    fs.writeFileSync(path.join(langTestsDir, `style${lang.cssExt}`), cssContent);

    // 3. Generate Snippets
    const snippetsDir = path.join(rootDir, 'snippets');
    if (!fs.existsSync(snippetsDir)) fs.mkdirSync(snippetsDir, {recursive: true});

    const snippetContent = {
        "Boilerplate": {
            "prefix": "!",
            "body": [
                `<${t('page')}>`,
                `  <${t('head')}>`,
                `    <${t('title')}>$1</${t('title')}>`,
                `    <${t('link')} href="./style${lang.cssExt}" rel="stylesheet" />`,
                `  </${t('head')}>`,
                `  <${t('body')}>`,
                `    <${t('h1')}>$2</${t('h1')}>`,
                `    $0`,
                `  </${t('body')}>`,
                `</${t('page')}>`
            ],
            "description": `${lang.name} HTML Boilerplate`
        }
    };

    fs.writeFileSync(path.join(snippetsDir, `${lang.id || lang.code + 'html'}.json`), JSON.stringify(snippetContent, null, 2));

    console.log(`Localized ${lang.name}`);
});
