export interface LanguageConfig {
    name: string;
    code: string; // ISO code
    htmlExt: string;
    cssExt: string;
    id: string; // VS Code Language ID for HTML
    cssId: string; // VS Code Language ID for CSS
}

export const supportedLanguages: LanguageConfig[] = []; // Deprecated, use finalSupportedLanguages

export const finalSupportedLanguages: LanguageConfig[] = [
    { name: "Tamil", code: "ta", htmlExt: ".thtml", cssExt: ".tcss", id: "thtml", cssId: "tcss" },
    { name: "Hindi", code: "hi", htmlExt: ".hhtml", cssExt: ".hcss", id: "hhtml", cssId: "hcss" },
    { name: "Bengali", code: "bn", htmlExt: ".bhtml", cssExt: ".bcss", id: "bnhtml", cssId: "bncss" },
    { name: "Telugu", code: "te", htmlExt: ".tehtml", cssExt: ".tecss", id: "tehtml", cssId: "tecss" },
    { name: "Marathi", code: "mr", htmlExt: ".mrhtml", cssExt: ".mrcss", id: "mrhtml", cssId: "mrcss" },
    { name: "Urdu", code: "ur", htmlExt: ".uhtml", cssExt: ".ucss", id: "urhtml", cssId: "urcss" },
    { name: "Gujarati", code: "gu", htmlExt: ".ghtml", cssExt: ".gcss", id: "guhtml", cssId: "gucss" },
    { name: "Kannada", code: "kn", htmlExt: ".khtml", cssExt: ".kcss", id: "knhtml", cssId: "kncss" },
    { name: "Odia", code: "or", htmlExt: ".ohtml", cssExt: ".ocss", id: "orhtml", cssId: "orcss" },
    { name: "Malayalam", code: "ml", htmlExt: ".mhtml", cssExt: ".mcss", id: "mlhtml", cssId: "mlcss" },
    { name: "Punjabi", code: "pa", htmlExt: ".pahtml", cssExt: ".pacss", id: "pahtml", cssId: "pacss" },
    { name: "Assamese", code: "as", htmlExt: ".ashtml", cssExt: ".ascss", id: "ashtml", cssId: "ascss" },
    { name: "Maithili", code: "mai", htmlExt: ".maihtml", cssExt: ".maicss", id: "maihtml", cssId: "maicss" },
    { name: "Santali", code: "sat", htmlExt: ".sathtml", cssExt: ".satcss", id: "sathtml", cssId: "satcss" },
    { name: "Kashmiri", code: "ks", htmlExt: ".kshtml", cssExt: ".kscss", id: "kshtml", cssId: "kscss" },
    { name: "Nepali", code: "ne", htmlExt: ".nhtml", cssExt: ".ncss", id: "nehtml", cssId: "necss" },
    { name: "Konkani", code: "kok", htmlExt: ".kohtml", cssExt: ".kocss", id: "kokhtml", cssId: "kokcss" },
    { name: "Sindhi", code: "sd", htmlExt: ".sdhtml", cssExt: ".sdcss", id: "sdhtml", cssId: "sdcss" },
    { name: "Dogri", code: "doi", htmlExt: ".dhtml", cssExt: ".dcss", id: "doihtml", cssId: "doicss" },
    { name: "Manipuri", code: "mni", htmlExt: ".mnihtml", cssExt: ".mnicss", id: "mnihtml", cssId: "mnicss" },
    { name: "Bodo", code: "brx", htmlExt: ".brxhtml", cssExt: ".brxcss", id: "brxhtml", cssId: "brxcss" },
    { name: "Sanskrit", code: "sa", htmlExt: ".sahtml", cssExt: ".sacss", id: "sahtml", cssId: "sacss" },
    { name: "Sourashtra", code: "sou", htmlExt: ".souhtml", cssExt: ".soucss", id: "souhtml", cssId: "soucss" }
];


export function getLanguageFromExt(fileName: string): LanguageConfig | undefined {
    return finalSupportedLanguages.find(lang => fileName.endsWith(lang.htmlExt) || fileName.endsWith(lang.cssExt));
}

export function getAllExtensions(): string[] {
    return finalSupportedLanguages.flatMap(l => [l.htmlExt, l.cssExt]);
}
