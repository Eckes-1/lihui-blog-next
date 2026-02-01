
"use client";
import React, { useEffect } from 'react';

type Heading = {
    text: string;
    level: number;
    id: string;
};

interface TOCProps {
    headings: Heading[];
}

export default function TOC({ headings }: TOCProps) {
    useEffect(() => {
        // Toggle TOC Collapse
        const toggleBtn = document.querySelector('.cap-action');
        const tocWidget = document.querySelector('#data-toc');

        const handleToggle = () => {
            tocWidget?.classList.toggle('collapse');
        };

        toggleBtn?.addEventListener('click', handleToggle);
        return () => toggleBtn?.removeEventListener('click', handleToggle);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToComment = () => {
        const commentSection = document.getElementById('comments');
        if (commentSection) {
            commentSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="widget-wrapper toc" id="data-toc">
            <div className="widget-header dis-select">
                <span className="name">本文目录</span>
                <a className="cap-action" style={{ cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6h11m-11 6h11m-11 6h11M4 6h1v4m-1 0h2m0 8H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
                </a>
            </div>
            <div className="widget-body">
                <ol className="toc">
                    {headings.map((heading, index) => (
                        <li key={index} className={`toc-item toc-level-${heading.level}`}>
                            <a className="toc-link" href={`#${heading.id}`}>
                                <span className="toc-text">{heading.text}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
            <div className="widget-footer">
                <a className="top" style={{ cursor: 'pointer' }} onClick={scrollToTop}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"><path strokeLinejoin="round" d="m9 15.5l3-3l3 3m-6-4l3-3l3 3" /><path d="M7 3.338A9.95 9.95 0 0 1 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12c0-1.821.487-3.53 1.338-5" /></g></svg>
                    <span>回到顶部</span>
                </a>
                <a className="buttom" style={{ cursor: 'pointer' }} onClick={scrollToComment}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M8 10.5h8M8 14h5.5M17 3.338A9.95 9.95 0 0 0 12 2C6.477 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.63 1.63 0 0 1 1.149.133A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10c0-1.821-.487-3.53-1.338-5" /></svg>
                    <span>参与讨论</span>
                </a>
            </div>
        </div>
    );
}
