
"use client";

import { useState } from "react";
import StellarMarkdown from "@/app/components/StellarMarkdown";
import { savePost } from "@/app/lib/actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import "../../admin.css";

export default function EditorClient({ post }: { post?: any }) {
    const [content, setContent] = useState(post?.content || "");
    const [title, setTitle] = useState(post?.title || "");
    const [slug, setSlug] = useState(post?.slug || "");
    const [date, setDate] = useState(post?.date || new Date().toISOString().split('T')[0]);
    const [tags, setTags] = useState(post?.tags || "");
    const [excerpt, setExcerpt] = useState(post?.excerpt || "");

    const isNew = !post;

    return (
        <form action={savePost} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Top Bar */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--theme-border)', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/admin/posts" style={{ color: 'var(--text-p1)' }}>
                        <ArrowLeft />
                    </Link>
                    <div style={{ fontWeight: 'bold' }}>{isNew ? 'New Post' : 'Edit Post'}</div>
                </div>

                <button type="submit" className="btn-primary">
                    <Save size={18} /> Save
                </button>
            </div>

            {/* Controls Bar */}
            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', background: 'var(--theme-bg)' }}>
                <input name="title" className="form-input" placeholder="Post Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <input name="slug" className="form-input" placeholder="url-slug" value={slug} onChange={e => setSlug(e.target.value)} required />
                <input name="date" type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                <input name="tags" className="form-input" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
            </div>

            <input type="hidden" name="originalSlug" value={isNew ? "new" : post.slug} />
            <input type="hidden" name="excerpt" value={excerpt} /> {/* Optional input for excerpt, maybe add UI later */}
            <input type="hidden" name="content" value={content} />

            {/* Main Editor */}
            <div className="editor-container" style={{ padding: '0 1rem 1rem 1rem', flex: 1 }}>
                <div className="editor-pane">
                    <div className="pane-header">Markdown</div>
                    <textarea
                        className="markdown-editor"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your markdown here..."
                    />
                </div>

                <div className="preview-pane">
                    <div className="pane-header">Preview</div>
                    <div className="preview-content stellar-markdown-body">
                        {/* We wrap in a div that might need specific classes if StellarMarkdown relies on usage within .md-text */}
                        <div className="md-text content">
                            <StellarMarkdown content={content} />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
