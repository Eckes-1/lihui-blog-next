
"use client";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

// Remark plugin to handle directives
function remarkStellarDirectives() {
    return (tree: any) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const data = node.data || (node.data = {});
                const tagName = node.type === 'textDirective' ? 'span' : 'div';

                // Map directive name to class name
                // e.g. :::note -> class="tag-plugin note"
                let className = `tag-plugin ${node.name}`;

                // Handle arguments (e.g. :::note[Title])
                // If there are attributes (:::note{type="info"}), add them to class
                if (node.attributes && node.attributes.class) {
                    className += ` ${node.attributes.class}`;
                }

                // Special handling for 'note' to match Stellar structure
                if (node.name === 'note') {
                    // Stellar notes have a specific structure:
                    // <div class="tag-plugin note">
                    //   <div class="title">Title</div> (optional)
                    //   <div class="body">Content</div>
                    // </div>

                    // In remark-directive, the title usually comes from checking the first child or label
                    // But simpler mapping is: content is children.

                    data.hName = 'div';
                    data.hProperties = { className: className };

                    // If we have a label (:::note[Title]), we should render it as title
                    // But transforming children structure in remark is complex.
                    // Easier approach: Use rehype plugin or custom component.
                    // Let's stick to standard behavior first: 
                    // node.children will be put inside the div.

                    // However, Stellar CSS expects .body wrapper for content.
                    // We will handle this by simple class addition for now.
                    // If precise structure is needed, we might need a Rehype plugin.
                } else {
                    data.hName = tagName;
                    data.hProperties = { className: className };
                }
            }
        });
    };
}

// Rehype plugin to restructure specific Stellar components
function rehypeStellarStructure() {
    return (tree: any) => {
        visit(tree, (node) => {
            if (node.type === 'element' && node.properties && node.properties.className) {
                const classes = (node.properties.className as string[]).join(' ');

                // Handle Note structure: wrap children in .body, extract title
                if (classes.includes('tag-plugin note')) {
                    // We need to verify if we can extract a title properly from directive label
                    // Unfortunately remark-directive puts label in `node.children` if using `:::note[label]`, 
                    // but standard container directive `:::note` usually puts everything in children.

                    // WORKAROUND: For exact Stellar replication, let's wrap ALL content in .body
                    // and if we can find a title mechanism later, we add .title

                    // Check if already modified
                    if (node.children.length > 0 && node.children[0].properties && node.children[0].properties.className === 'body') {
                        return;
                    }

                    const bodyNode = {
                        type: 'element',
                        tagName: 'div',
                        properties: { className: ['body'] },
                        children: node.children
                    };

                    node.children = [bodyNode];

                    // If there was a label/title passed via directive, it's hard to catch here without passing data from remark.
                    // So for now, we just ensure the .body wrapper exists which is CRITICAL for Stellar CSS.
                }

                // Timeline handling
                if (classes.includes('tag-plugin timeline')) {
                    // Stellar timeline structure: .tag-plugin.timeline > .timenode
                    // Markdown: 
                    // :::timeline
                    // - **Date** Content
                    // :::
                    // This usually renders as div > ul > li
                    // We might need to transform ul/li to div.timenode
                }
            }
        });
    };
}


// Preprocessor to convert Hexo syntax to Directive syntax
const preprocessContent = (content: string) => {
    if (!content) return "";

    let newContent = content;

    // Replace {% note class %} ... {% endnote %}
    // Regex needs to handle multiline.
    // Hexo: {% note info title %}
    // Directive: :::note[title]{class="info"} (approximate)
    // Simplified: :::note (with class derived)

    // Case 1: {% note class %} -> :::note{.class}
    // We map Hexo classes to directive classes
    // Hexo: {% note info %} -> :::note{.info}

    // Replace Start Tags
    newContent = newContent.replace(/{%\s*note\s+([^%]+)\s*%}/g, (match, args) => {
        const parts = args.trim().split(/\s+/);
        const type = parts[0]; // e.g. info, warning
        // If there are more parts, they might be title, but Hexo note usually doesn't take separate title arg in this syntax variant commonly?
        // Actually Stellar supports: {% note color title %}

        return `:::note{class="${type}"}`;
    });

    // Replace End Tags
    newContent = newContent.replace(/{%\s*endnote\s*%}/g, ":::");

    // Replace {% timeline %} ... {% endtimeline %}
    // Usually this wraps a list.
    newContent = newContent.replace(/{%\s*timeline\s*%}/g, `:::timeline`);
    newContent = newContent.replace(/{%\s*endtimeline\s*%}/g, `:::`);

    return newContent;
};

export default function StellarMarkdown({ content }: { content: string }) {
    const processedContent = preprocessContent(content);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkDirective, remarkStellarDirectives]}
            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug, rehypeStellarStructure]}
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
                // Add custom renderers for timeline lists if needed
                div: (props) => {
                    const { node, className, children, ...rest } = props;

                    // Custom transform for Timeline Lists
                    if (className?.includes('timeline')) {
                        // If children contains a UL, we might want to unwrap it or style it
                        return <div className={className} {...rest}>{children}</div>;
                    }
                    return <div className={className} {...rest}>{children}</div>;
                }
            }}
        >
            {processedContent}
        </ReactMarkdown>
    );
}
