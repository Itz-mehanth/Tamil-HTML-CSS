"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssMap = exports.htmlMap = void 0;
exports.compile = compile;
exports.compileCSS = compileCSS;
exports.htmlMap = {
    // --- Root & Metadata ---
    "பக்கம்": "html",
    "தலை": "head",
    "தலைப்பு": "title",
    "உடல்": "body",
    "விபரம்": "meta",
    "தொடுப்பு": "link",
    "பாணி": "style",
    "நிரல்": "script",
    // --- Sections ---
    "தலைப்பாகம்": "header",
    "அடிப்பகுதி": "footer",
    "திசை": "nav",
    "பிரிவு": "section",
    "கட்டுரை": "article",
    "ஓரம்": "aside",
    "முக்கியம்": "main",
    // --- Headings ---
    "தலைப்பு1": "h1",
    "தலைப்பு2": "h2",
    "தலைப்பு3": "h3",
    "தலைப்பு4": "h4",
    "தலைப்பு5": "h5",
    "தலைப்பு6": "h6",
    // --- Content Containers ---
    "களம்": "div",
    "பகுதி": "span",
    "பத்தி": "p",
    "முறிவு": "br",
    "கோடு": "hr",
    // --- Text Formatting ---
    "தடிமன்": "b",
    "வலிமை": "strong",
    "சாய்வு": "i",
    "அழுத்தம்": "em",
    "சிறிய": "small",
    "குறி": "mark",
    "கீழ்": "sub",
    "மேல்": "sup",
    "நீக்கு": "del",
    "சேர்": "ins",
    // --- Lists ---
    "பட்டியல்": "ul",
    "எண்_பட்டியல்": "ol",
    "உருப்படி": "li",
    // --- Media ---
    "படம்": "img",
    "காணொளி": "video",
    "ஒலி": "audio",
    "மூலம்": "source",
    "வரைபடம்": "canvas",
    // --- Links ---
    "இணைப்பு": "a",
    // --- Tables ---
    "அட்டவணை": "table",
    "அட்டவணை_தலை": "thead",
    "அட்டவணை_உடல்": "tbody",
    "அட்டவணை_கால்": "tfoot",
    "வரிசை": "tr",
    "தலைப்பு_கட்டம்": "th",
    "தரவு": "td",
    // --- Forms ---
    "படிவம்": "form",
    "உள்ளீடு": "input",
    "பொத்தான்": "button",
    "தேர்வு": "select",
    "விருப்பம்": "option",
    "உரைப்பெட்டி": "textarea",
    "சீட்டு": "label",
    "சட்டகம்": "fieldset",
    "விளக்கம்": "legend",
    // --- Interactive ---
    "விவரங்கள்": "details",
    "சுருக்கம்": "summary",
    "உரையாடல்": "dialog",
    // --- HTML Attributes ---
    "வகுப்பு": "class",
    "அடையாளம்": "id",
    "பாதை": "src",
    "முகவரி": "href",
    "வகை": "type",
    "அகலம்": "width",
    "உயரம்": "height",
    "மாற்று": "alt",
    "உறவு": "rel",
    "இடக்காட்டி": "placeholder",
    "பெயர்": "name",
    "செயல்": "action",
    "முறை": "method",
    "இலக்கு": "target"
};
exports.cssMap = {
    // --- Layout & Box Model ---
    "காட்சி": "display",
    "அமைவிடம்": "position",
    "மிதவை": "float",
    "தெளிவு": "clear",
    "நிரம்பிவழிதல்": "overflow",
    "அகலம்": "width",
    "உயரம்": "height",
    "அதிகபட்ச_அகலம்": "max-width",
    "குறைந்தபட்ச_அகலம்": "min-width",
    "விளிம்பு": "margin",
    "மேல்_விளிம்பு": "margin-top",
    "கீழ்_விளிம்பு": "margin-bottom",
    "இடது_விளிம்பு": "margin-left",
    "வலது_விளிம்பு": "margin-right",
    "உள்வெளி": "padding", // Renamed from idai-veli to specific padding term
    "மேல்_உள்வெளி": "padding-top",
    "கீழ்_உள்வெளி": "padding-bottom",
    "இடது_உள்வெளி": "padding-left",
    "வலது_உள்வெளி": "padding-right",
    "எல்லை": "border",
    "எல்லை_ஆரம்": "border-radius",
    "பெட்டி_நிழல்": "box-shadow",
    "அடுக்கு_வரிசை": "z-index",
    "மேல்": "top",
    "கீழ்": "bottom", // Context aware: in CSS values/props only
    "இடது": "left",
    "வலது": "right",
    // --- Flexbox ---
    "கூட்டம்": "flex",
    "திசை": "flex-direction",
    "சுருக்கம்": "flex-shrink",
    "வளர்ச்சி": "flex-grow",
    "மடிப்பு": "flex-wrap",
    "கிடைமட்ட_சீரமைப்பு": "justify-content",
    "செங்குத்து_சீரமைப்பு": "align-items",
    "உள்ளடக்க_சீரமைப்பு": "align-content",
    "வரிசை": "row",
    "நெடுவரிசை": "column", // Explicit difference from 'Script' (Niral)
    "தலைகீழ்_வரிசை": "row-reverse",
    "தலைகீழ்_நெடுவரிசை": "column-reverse",
    // --- Grid ---
    "கட்டம்": "grid",
    "இடைவெளி": "gap",
    "கட்ட_நிரல்கள்": "grid-template-columns",
    "கட்ட_வரிசைகள்": "grid-template-rows",
    "கட்ட_பகுதி": "grid-area",
    "பகுதி": "fraction", // for '1fr' -> '1பகுதி' ? No, 'fr' is unit. leaving units as english for now mostly, or 'பங்கு' (share)
    // --- Typography ---
    "நிறம்": "color",
    "எழுத்து_வகை": "font-family",
    "எழுத்து_அளவு": "font-size",
    "எழுத்து_பாணி": "font-style",
    "எழுத்து_தடிமன்": "font-weight",
    "வரி_உயரம்": "line-height",
    "சீரமைப்பு": "text-align",
    "அலங்காரம்": "text-decoration",
    "மாற்றம்": "text-transform", // uppercase/lowercase
    "நிழல்": "text-shadow",
    // --- Background ---
    "பின்புலம்": "background",
    "பின்புல_நிறம்": "background-color",
    "பின்புல_படம்": "background-image",
    "பின்புல_அளவு": "background-size",
    "பின்புல_இடம்": "background-position",
    // --- Values ---
    "சிவப்பு": "red",
    "நீலம்": "blue",
    "பச்சை": "green",
    "கருப்பு": "black",
    "வெள்ளை": "white",
    "மஞ்சள்": "yellow",
    "ஊதா": "purple",
    "ஆரஞ்சு": "orange",
    "சாம்பல்": "gray",
    "வெளிப்படை": "transparent",
    "திட": "solid",
    "கோடு_கோடாக": "dashed",
    "புள்ளி": "dotted",
    "இரட்டை": "double",
    "மையம்": "center",
    "நியாயப்படுத்து": "justify",
    "நிரல்_வரிசை": "block",
    "வரிசை_முறை": "inline",
    "வரிசை_நிரல்": "inline-block",
    "இல்லை": "none",
    "மறை": "hidden",
    "காணு": "visible",
    "சார்பு": "relative",
    "தனி": "absolute",
    "நிலையான": "fixed",
    "ஒட்டும்": "sticky",
    "கரம்": "pointer",
    "சுட்டி": "cursor",
    // --- Selectors & Pseudo-classes ---
    "வகுப்பு_": ".", // Class with separator
    "வகுப்பு": ".", // Class without separator
    "அடையாளம்_": "#", // ID with separator
    "அடையாளம்": "#", // ID without separator
    "எல்லாம்": "*", // Universal
    ":சுட்டி_மேல்": ":hover",
    ":செயலில்": ":active",
    ":கவனம்": ":focus",
    ":வருகை_தந்தது": ":visited",
    ":முதல்_பிள்ளை": ":first-child",
    ":கடைசி_பிள்ளை": ":last-child",
    ":முன்": "::before",
    ":பின்": "::after",
    // --- Units/Misc ---
    "முக்கியம்!": "!important",
    "தானியங்கி": "auto",
    // --- Media Queries ---
    "@ஊடகம்": "@media",
    "@இறக்குமதி": "@import",
    "திரை": "screen",
};
function compile(code) {
    let html = code;
    // 1. Process Attributes / Inline CSS first
    // Look for பாணி="..." or style="..."
    html = html.replace(/(பாணி|style)="([^"]*)"/g, (match, field, content) => {
        let styleContent = content;
        // Replace CSS keys inside the quotes only
        const sortedCss = Object.keys(exports.cssMap).sort((a, b) => b.length - a.length);
        for (const k of sortedCss) {
            // Global replace inside the style string
            styleContent = styleContent.split(k).join(exports.cssMap[k]);
        }
        return `${field}="${styleContent}"`;
    });
    // 2. Process Embedded CSS (<பாணி> / <style>)
    // Must happen BEFORE global HTML replacement to preserve selectors if they match HTML tags
    // Regex updated to handle attributes: <பாணி ...> content </பாணி>
    html = html.replace(/<(பாணி|style)([^>]*)>([\s\S]*?)<\/(பாணி|style)>/g, (match, tag, attrs, content, closeTag) => {
        // tag: "பாணி" or "style"
        // attrs: attributes string (e.g. ' type="text/css"')
        // content: the css code
        // closeTag: "பாணி" or "style"
        // We compile the content. We leave the tag/attrs alone; 
        // Step 3 (Global HTML) will rename "பாணி" to "style" in the tag itself.
        return `<${tag}${attrs}>${compileCSS(content)}</${closeTag}>`;
    });
    // 3. Process HTML Tags (Global)
    // Sort keys by length (descending) to prevent partial replacement issues
    const sortedKeys = Object.keys(exports.htmlMap).sort((a, b) => b.length - a.length);
    for (const k of sortedKeys) {
        html = html.split(k).join(exports.htmlMap[k]);
    }
    // Exports for intellisense usage need both maps merged conceptually or handled in extension.ts
    return `<!DOCTYPE html>\n${html}`;
}
function compileCSS(code) {
    let css = code;
    // Sort CSS keys by length
    const sortedCss = Object.keys(exports.cssMap).sort((a, b) => b.length - a.length);
    for (const k of sortedCss) {
        css = css.split(k).join(exports.cssMap[k]);
    }
    const sortedHtml = Object.keys(exports.htmlMap).sort((a, b) => b.length - a.length);
    for (const k of sortedHtml) {
        css = css.split(k).join(exports.htmlMap[k]);
    }
    return css;
}
//# sourceMappingURL=compiler.js.map