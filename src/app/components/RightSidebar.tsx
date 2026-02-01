
interface RightSidebarProps {
    children?: React.ReactNode;
}

export default function RightSidebar({ children }: RightSidebarProps) {
    return (
        <aside className="l_right">
            <div className="widgets">
                {children}

                <div className="widget-wrapper tagcloud">
                    <div className="widget-header dis-select">
                        <span className="name">标签云</span>
                    </div>
                    <div className="widget-body fs14">
                        <a href="/tags/Hexo/" style={{ fontSize: "12px" }} className="tag -0">Hexo</a>
                        <a href="/tags/Blog/" style={{ fontSize: "12px" }} className="tag -0">博客</a>
                    </div>
                </div>

                <div className="widget-wrapper ghrepo">
                    <div className="widget-body">
                        <div className="items data-service ds-ghinfo" data-api="https://api.github.com/repos/Eckes-1/lihui-blog">
                            <a className="repo" href="https://github.com/Eckes-1/lihui-blog" target="_blank" rel="external nofollow noopener noreferrer">
                                <div className="repo-name flex-row">
                                    <svg aria-hidden="true" role="img" className="color-icon-primary" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor" style={{ userSelect: "none", overflow: "visible" }}>
                                        <path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                                    </svg>
                                    Eckes-1/lihui-blog
                                </div>
                                <div className="repo-desc">
                                    <span id="description">分享技术与生活</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </aside>
    );
}
