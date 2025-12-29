import { htmlMap as taHtml, cssMap as taCss } from './locales/ta';

// Default to Tamil
export let htmlMap = taHtml;
export let cssMap = taCss;

export function loadLocale(code: string) {
    try {
        // Dynamic import based on language code
        // Note: In webpack/esbuild this might need specific glob patterns, 
        // but for VS Code extension (CommonJS) simple require works if files exist.
        const locale = require(`./locales/${code}`);
        if (locale && locale.htmlMap && locale.cssMap) {
            htmlMap = locale.htmlMap;
            cssMap = locale.cssMap;
            return;
        }
    } catch (e) {
        console.warn(`Locale ${code} not found, falling back to Tamil.`);
    }
    
    // Fallback
    htmlMap = taHtml;
    cssMap = taCss;
}

export function compile(code: string): string {
    let html = code;

    // Regex to match tags: <tag ...> or </tag>
    // Group 1: Closing slash (opt)
    // Group 2: Tag Name
    // Group 3: Attributes (opt)
    // Group 4: Self-closing slash (opt)
    // This simple regex handles most cases. It might choke on very complex attributes with > inside quotes,
    // but standard VS Code highlighting engines use similar heuristics.
    const tagRegex = /<(\/?)([^\s>\/]+)([^>]*?)(\/?)>/g;

    html = html.replace(tagRegex, (match, closeSlash, tagName, attributes, selfClose) => {
        // 1. Translate Tag Name
        // Check exact match in map, or fallback to original
        const translatedTag = htmlMap[tagName] || tagName;
        
        let newAttributes = attributes;

        if (attributes && attributes.trim().length > 0) {
            // 2. Translate Attributes
            // We need to match key="value" or boolean attributes
            // Regex: ([^\s=]+)(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?
            const attrRegex = /([^\s=]+)(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
            
            newAttributes = attributes.replace(attrRegex, (attrMatch: string, attrKey: string, qVal: string, sqVal: string, rawVal: string) => {
                // Determine the value and the quote style
                const val = qVal !== undefined ? qVal : (sqVal !== undefined ? sqVal : rawVal);
                const quote = qVal !== undefined ? '"' : (sqVal !== undefined ? "'" : '');
                
                // Translate Attribute Key
                const translatedKey = htmlMap[attrKey] || attrKey;

                // Handle Special Attributes
                let translatedVal = val;
                
                if (val) {
                    // If style attribute, compile CSS
                    if (translatedKey === 'style') {
                        translatedVal = compileCSS(val);
                    }
                    // If it's a known boolean value or mapped value (rare in HTML attrs except types)
                    // e.g. type="submit" -> could be translated if we strictly mapped values.
                    // For now, let's trusting compileCSS and plain values. 
                    // We shouldn't translate file paths or IDs generally in attributes unless they are keywords.
                }

                if (val !== undefined) {
                    return `${translatedKey}=${quote}${translatedVal}${quote}`;
                } else {
                    return `${translatedKey}`; // Boolean attribute
                }
            });
        }

        return `<${closeSlash}${translatedTag}${newAttributes}${selfClose}>`;
    });

    // 2. Process Embedded CSS (<style>...</style>)
    // The previous pass renamed <பாணி> to <style>. Now we find <style> tags and compile content.
    // We look for <style...>...</style> where the tag name is ALREADY translated to 'style'
    // or if the user used the native tag and it got translated.
    // The previous regex replacer DID translate the tag name.
    
    // We need a second pass to find <style> blocks and compile their INNER text.
    // Because the first pass only touched the TAGS, not the content.
    const styleBlockRegex = /<style([^>]*)>([\s\S]*?)<\/style>/g;
    html = html.replace(styleBlockRegex, (match, attrs, cssContent) => {
        return `<style${attrs}>${compileCSS(cssContent)}</style>`;
    });

    return `<!DOCTYPE html>\n${html}`;
}

export function compileCSS(code: string): string {
    let css = code;

    // 1. Mask Strings to prevent modifying content
    // Matches "..." or '...'
    const strings: string[] = [];
    const stringRegex = /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g;
    
    // Replace strings with __STR_N__
    css = css.replace(stringRegex, (match) => {
        const placeholder = `__STR_${strings.length}__`;
        strings.push(match);
        return placeholder;
    });

    // Sort CSS keys by length
    const sortedCss = Object.keys(cssMap).sort((a, b) => b.length - a.length);
    const sortedHtml = Object.keys(htmlMap).sort((a, b) => b.length - a.length);

    // Hybrid approach for keyword replacement:
    
    // Replace known CSS Properties and Values
    for (const k of sortedCss) {
        // Use split/join which is fast and supports global replacement
        // Since strings are masked, we are mostly safe.
        // Ideally we'd use word boundaries \b, but Indic languages don't always respect \b logic perfectly
        // and some CSS values might be joined. 
        // Given the specific nature of these keywords, split/join is acceptable after masking.
        css = css.split(k).join(cssMap[k]);
    }

    // Replace HTML Tags used as Selectors
    for (const k of sortedHtml) {
        css = css.split(k).join(htmlMap[k]);
    }

    // 3. Unmask Strings
    css = css.replace(/__STR_(\d+)__/g, (match, index) => {
        return strings[parseInt(index, 10)];
    });

    return css;
}
