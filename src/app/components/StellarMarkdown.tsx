
"use client";
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';

/**
 * Preprocess Content to convert Hexo Tags to HTML/Directives
 * This acts as the bridge between Hexo syntax and standardized HTML structure expected by Stellar CSS
 */
const preprocessContent = (content: string) => {
    if (!content) return "";

    let newContent = content;

    // --- 1. Note Tag (Flexible Args) ---
    // {% note [color:color] [title] content %}
    // Regex needs to be robust for optional args.
    // Note: content in capture group 2 might contain newlines
    newContent = newContent.replace(
        /{%\s*note\s+(.*?)\s*%}([\s\S]*?){%\s*endnote\s*%}/g,
        (match, args, body) => {
            const argParts = args.trim().split(/\s+/);
            let color = 'default';
            let title = '';

            const colors = ['default', 'blue', 'pink', 'red', 'purple', 'orange', 'green', 'info', 'warning', 'error', 'success'];

            // Heuristic to detect if first arg is color or title
            if (colors.includes(argParts[0])) {
                color = argParts[0];
                title = argParts.slice(1).join(' ');
            } else if (argParts[0].includes(':')) {
                // handle key:value like color:blue
                const kv = argParts[0].split(':');
                if (kv[0] === 'color') color = kv[1];
                title = argParts.slice(1).join(' ');
            } else {
                // Assume it's just title, use default color
                title = argParts.join(' ');
            }

            // Stellar HTML Structure for Note
            // <div class="tag-plugin colorful note" color="class_name"> ... </div>
            // Note: Stellar CSS uses attribute selectors often [color=...] or checks classes.
            // Based on note.js: class="tag-plugin colorful note" + ctx.args.joinTags...

            return `
<div class="tag-plugin colorful note" color="${color}">
  ${title ? `<div class="title">${title}</div>` : ''}
  <div class="body">
    ${body}
  </div>
</div>
`;
        });

    // --- 2. Folding Tag ---
    // {% folding [color:yellow] [child:codeblock] [open:false] title %}
    newContent = newContent.replace(
        /{%\s*folding\s+(.*?)\s*%}([\s\S]*?){%\s*endfolding\s*%}/g,
        (match, args, body) => {
            const argParts = args.trim().split(/\s+/);
            let color = '';
            let titleParts: string[] = [];
            let isOpen = false;
            let child = '';

            argParts.forEach((part: string) => {
                if (part.includes(':')) {
                    const [k, v] = part.split(':');
                    if (k === 'color') color = v;
                    if (k === 'open') isOpen = v === 'true';
                    if (k === 'child') child = v;
                } else {
                    titleParts.push(part);
                }
            });
            const title = titleParts.join(' ');

            return `
<details class="tag-plugin colorful folding" ${color ? `color="${color}"` : ''} ${child ? `child="${child}"` : ''} ${isOpen ? 'open' : ''}>
  <summary>${title}</summary>
  <div class="body">
    ${body}
  </div>
</details>
`;
        }
    );

    // --- 3. Timeline ---
    // Support two formats:
    // 1. <!-- node header --> body (Standard Stellar default)
    // 2. - **Header** Body (Markdown list, user preferred)
    newContent = newContent.replace(
        /{%\s*timeline\s*(.*?)\s*%}([\s\S]*?){%\s*endtimeline\s*%}/g,
        (match, args, body) => {
            let html = `<div class="tag-plugin timeline">`;

            // Try standard node format first
            if (body.includes('<!-- node')) {
                const nodes = body.split(/<!--\s*node (.*?)\s*-->/);
                for (let i = 1; i < nodes.length; i += 2) {
                    const header = nodes[i];
                    const content = nodes[i + 1];
                    html += `
                  <div class="timenode" index="${(i - 1) / 2}">
                      <div class="header">${header ? `<span>${header}</span>` : ''}</div>
                      <div class="body fs14">${content}</div>
                  </div>`;
                }
            } else {
                // Fallback to Markdown list format
                // Expected: - **Header** Body or - Header: Body
                const items = body.split(/\n-\s+/).filter(i => i.trim());
                items.forEach((item, index) => {
                    // Extract header from first bold **...** or first line
                    let header = '';
                    let content = item;

                    const headerMatch = item.match(/^\*\*(.*?)\*\*(.*)/s);
                    if (headerMatch) {
                        header = headerMatch[1];
                        content = headerMatch[2];
                    } else {
                        // Maybe just split by first newline?
                        const lines = item.split('\n');
                        header = lines[0]; // Simple header
                        content = lines.slice(1).join('\n');
                    }

                    html += `
                  <div class="timenode" index="${index}">
                      <div class="header">${header ? `<span>${header}</span>` : ''}</div>
                      <div class="body fs14">${content}</div>
                  </div>`;
                });
            }

            html += `</div>`;
            return html;
        }
    );

    // --- 6. Link ---
    // {% link url [title] [desc:desc] [icon:src] %}
    newContent = newContent.replace(
        /{%\s*link\s+(.*?)\s*%}/g,
        (match, args) => {
            const argParts = args.trim().split(/\s+/);
            const props: any = {};
            let url = '';
            let title = '';

            argParts.forEach((part: string) => {
                if (part.includes(':')) {
                    const [k, v] = part.split(':');
                    props[k] = v;
                } else if (!url) {
                    url = part;
                } else {
                    title += (title ? ' ' : '') + part;
                }
            });
            props.url = props.url || url;
            props.title = props.title || title || props.url;

            const isRich = props.desc ? 'rich' : 'plain';

            return `
             <div class="tag-plugin link dis-select">
                <a class="link-card ${isRich}" title="${props.title}" href="${props.url}" target="_blank" rel="external nofollow noopener noreferrer" cardlink>
                    ${props.desc ? `
                        <div class="top">
                             ${props.icon ? `<div class="lazy img" style="background-image:url(${props.icon})"></div>` : ''}
                             <span class="cap link footnote">${props.url}</span>
                        </div>
                        <div class="bottom">
                            <span class="title">${props.title}</span>
                            <span class="cap desc footnote">${props.desc}</span>
                        </div>
                    ` : `
                        <div class="left">
                            <span class="title">${props.title}</span>
                            <span class="cap link footnote">${props.url}</span>
                        </div>
                        <div class="right">
                             ${props.icon ? `<div class="lazy img" style="background-image:url(${props.icon})"></div>` : ''}
                        </div>
                    `}
                </a>
             </div>
             `;
        }
    );

    // --- 7. Button ---
    // {% button [color:color] text url [icon:key/src] [size:xs] %}
    newContent = newContent.replace(
        /{%\s*button\s+(.*?)\s*%}/g,
        (match, args) => {
            const props: any = { size: 'md', color: 'default' };
            const argParts = args.trim().split(/\s+/);
            const loose: string[] = [];

            argParts.forEach((part: string) => {
                if (part.includes(':')) {
                    const [k, v] = part.split(':');
                    props[k] = v;
                } else {
                    loose.push(part);
                }
            });

            let text = '';
            let url = '';

            loose.forEach((val: string) => {
                if (val.match(/^https?:\/\//) || val.match(/^\//)) {
                    url = val;
                } else {
                    text += (text ? ' ' : '') + val;
                }
            });

            return `
            <a class="tag-plugin colorful button" color="${props.color}" size="${props.size}" title="${text}" href="${url}">
                ${props.icon ? `<img src="${props.icon}" style="width:1.2em;height:1.2em;vertical-align:middle;margin-right:4px;"/>` : ''}
                <span>${text}</span>
            </a>
            `;
        }
    );

    // --- 8. Friends ---
    newContent = newContent.replace(
        /{%\s*friends\s+(.*?)\s*%}/g,
        (match, args) => {
            return `<div class="tag-plugin users-wrap" data-args="${args}"><div class="grid-box">Loading Friends...</div></div>`;
        }
    );

    // --- 9. About ---
    newContent = newContent.replace(
        /{%\s*about\s+(.*?)\s*%}([\s\S]*?){%\s*endabout\s*%}/g,
        (match, args, body) => {
            const props: any = {};
            args.trim().split(/\s+/).forEach((part: string) => {
                const [k, v] = part.split(':');
                props[k] = v;
            });

            return `
             <div class="tag-plugin about">
                 ${props.avatar ? `
                 <div class="about-header">
                    <div class="avatar">
                        <img src="${props.avatar}" style="${props.border ? `border-radius:${props.border};` : ''}" height="${props.height || '80px'}"/>
                    </div>
                 </div>` : ''}
                 <div class="about-body fs14">
                    ${body}
                 </div>
             </div>
             `;
        }
    );

    // --- 4. Grid ---
    newContent = newContent.replace(
        /{%\s*grid\s*(.*?)\s*%}([\s\S]*?){%\s*endgrid\s*%}/g,
        (match, args, body) => {
            const argMap: any = {};
            args.trim().split(/\s+/).forEach((part: string) => {
                const [k, v] = part.split(':');
                if (k && v) argMap[k] = v;
            });

            const w = argMap.w || (argMap.c ? null : '240px');
            let style = '';
            if (w) style += `grid-template-columns: repeat(auto-fill, minmax(${w}, 1fr));`;
            else if (argMap.c) style += `grid-template-columns: repeat(${argMap.c}, 1fr);`;
            if (argMap.gap) style += `grid-gap:${argMap.gap};`;

            const cells = body.split(/<!--\s*cell\s*-->/);
            let cellsHtml = '';
            cells.forEach((cell: string) => {
                if (cell.trim()) {
                    cellsHtml += `<div class="cell" style="${argMap.br ? `border-radius:${argMap.br};` : ''}">${cell}</div>`;
                }
            });

            return `<div class="tag-plugin grid" style="${style}" ${argMap.bg ? `bg="${argMap.bg}"` : ''}>${cellsHtml}</div>`;
        }
    );

    // --- 5. Tabs ---
    newContent = newContent.replace(
        /{%\s*tabs\s*(.*?)\s*%}([\s\S]*?){%\s*endtabs\s*%}/g,
        (match, args, body) => {
            const parts = body.split(/<!--\s*tab (.*?)\s*-->/);

            let nav = '<div class="nav-tabs">';
            let contentHtml = '<div class="tab-content">';
            let idBase = 'tab-' + Math.random().toString(36).substr(2, 9);

            for (let i = 1; i < parts.length; i += 2) {
                const title = parts[i];
                const content = parts[i + 1];
                const activeClass = i === 1 ? ' active' : '';
                const id = `${idBase}-${i}`;

                // Use onclick handler bound to window
                nav += `<div class="tab${activeClass}" data-href="${id}"><a href="javascript:;" onclick="selectTab('${id}')">${title}</a></div>`;
                contentHtml += `<div class="tab-pane${activeClass}" id="${id}">${content}</div>`;
            }
            nav += '</div>';
            contentHtml += '</div>';

            return `<div class="tag-plugin tabs" id="${idBase}">${nav}${contentHtml}</div>`;
        }
    );

    return newContent;
};

// Client-side script for Tabs and interactions
const Scripts = () => {
    useEffect(() => {
        // Expose selectTab globally
        (window as any).selectTab = (id: string) => {
            const pane = document.getElementById(id);
            if (!pane) return;
            const wrapper = pane.closest('.tag-plugin.tabs');
            if (!wrapper) return;

            // Toggle Nav
            wrapper.querySelectorAll('.nav-tabs .tab').forEach((el: Element) => {
                if (el.getAttribute('data-href') === id) el.classList.add('active');
                else el.classList.remove('active');
            });

            // Toggle Content
            wrapper.querySelectorAll('.tab-content .tab-pane').forEach((el: Element) => {
                if (el.id === id) el.classList.add('active');
                else el.classList.remove('active');
            });
        };
    }, []);
    return null;
};

export default function StellarMarkdown({ content }: { content: string }) {
    const processedContent = preprocessContent(content);

    return (
        <>
            <Scripts />
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkDirective]}
                rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
                components={{
                    img: (props) => (
                        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                        <img
                            {...props}
                            referrerPolicy="no-referrer"
                            style={{
                                maxWidth: '100%',
                                borderRadius: '8px',
                                display: 'block',
                                margin: '1em auto'
                            }}
                        />
                    ),
                    div: ({ node, ...props }) => <div {...props} />
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </>
    );
}
