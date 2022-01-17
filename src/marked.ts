import marked, { Renderer, RendererObject, Tokenizer, TokenizerObject } from 'marked';
import Prism from 'prismjs';
import katex from 'katex';
import loadLanguages from 'prismjs/components/';

function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Languages I have plan to write in my posts
loadLanguages();

Prism.languages.insertBefore('bash', 'variable', {
    variable: /\B(--[\w-]+|-\w)/,
    function: /^\w+/m,
});

const renderer: RendererObject = {
    // Override code block
    code(code: string, infostring: string) {
        if (infostring === 'Math') {
            const katexRendered = katex.renderToString(code, {
                displayMode: true,
                output: 'html',
                throwOnError: false,
            });
            return `<span class="katex-display">
            ${katexRendered}
            </span>`;
        } else {
            try {
                return `<pre class = "language-${infostring}"><code class = "language-${infostring}">${Prism.highlight(
                    code,
                    Prism.languages[infostring],
                    infostring
                )}</code></pre>`;
            } catch (err) {
                return false;
            }
        }
    },
    // Override inline code
    codespan(code: string) {
        // It's kaTeX if first charactar is $
        if (code.length >= 2 && code[0] === '$' && code[code.length - 1] === '$') {
            return katex.renderToString(code.substring(1, code.length - 2), {
                throwOnError: false,
            });
        } else {
            // or just use original code
            return `<code class = "inline-code">${escapeHtml(code)}</code>`;
        }
    },
    listitem(text: string) {
        return '<li>' + text + '</li>\n';
    },
    checkbox(checked: boolean) {
        return (
            '<input ' +
            (checked ? 'checked="" ' : '') +
            'type="checkbox"' +
            ((this as Renderer).options.xhtml ? ' /' : '') +
            '> '
        );
    },
};

const tokenizer: TokenizerObject = {
    // Match for inline $ ... $ syntax
    codespan(src: string) {
        const match = src.match(/^([`$])([^\1]+?)\1/);
        if (match) {
            return {
                type: 'codespan',
                raw: match[0],
                // If codespan is TeX, put ` charactar
                text: match[1] === '$' ? `$${match[2].trim()}$` : match[2].trim(),
            };
        }
        return false;
    },
    // Disable inline text when meeting $ inline
    inlineText(src: string, inRawBlock: boolean, smartypants: (cap: string) => string) {
        const cap = src.match(
            /^([`$]+|[^`$])(?:[\s\S]*?(?:(?=[\\<![`$*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
        );
        const options = (this as Tokenizer).options;
        if (cap) {
            let text: string;
            if (inRawBlock) {
                text = options.sanitize
                    ? options.sanitizer
                        ? options.sanitizer(cap[0])
                        : cap[0]
                    : cap[0];
            } else {
                text = options.smartypants ? smartypants(cap[0]) : cap[0];
            }
            return {
                type: 'text',
                raw: cap[0] as string,
                text: text,
            };
        }
        return false;
    },
    // Match for $$ ... $$ blocks
    fences(src: string) {
        const cap = src.match(
            /^ {0,3}(`{3,}|\${2,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`$]* *(?:\n+|$)|$)/
        );
        if (cap) {
            return {
                type: 'code',
                raw: cap[0],
                codeBlockStyle: 'indented',
                // for $$ ... $$ block, set language as Math
                lang: cap[1] === '$$' ? 'Math' : cap[2].trim(),
                text: cap[3],
            };
        }
        return false;
    },
};

marked.use({ renderer, tokenizer });

export default marked;
