import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

export default function LeftSidebar() {
    return (
        <aside className="l_left">
            <div className="sidebg"></div>
            <div className="leftbar-container">

                <header className="header">
                    <div className="logo-wrap">
                        <Link className="avatar" href="/about">
                            <div className="bg" style={{ opacity: 0, backgroundImage: "url(https://gcore.jsdelivr.net/gh/cdn-x/placeholder@1.0.12/avatar/round/rainbow64@3x.webp)" }}></div>
                            <img className="avatar" src="/images/avatar.jpg" alt="avatar" />
                        </Link>
                        <Link className="title" href="/">
                            <div className="main">LIHUI</div>
                            <div className="sub cap">分享技术与生活</div>
                        </Link>
                    </div>
                </header>

                <div className="nav-area">
                    <nav className="menu dis-select">
                        <Link className="nav-item" title="首页" href="/" style={{ color: "#1BCDFC" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M20 12a8 8 0 1 1-16 0a8 8 0 0 1 16 0" opacity=".5" /><path fill="currentColor" d="M17.712 5.453c1.047-.193 2.006-.259 2.797-.152c.77.103 1.536.393 1.956 1.064c.446.714.312 1.542-.012 2.258c-.33.728-.918 1.499-1.672 2.268c-1.516 1.547-3.836 3.226-6.597 4.697c-2.763 1.472-5.495 2.484-7.694 2.92c-1.095.217-2.098.299-2.923.201c-.8-.095-1.6-.383-2.032-1.075c-.47-.752-.296-1.63.07-2.379c.375-.768 1.032-1.586 1.872-2.403L4 12.416c0 .219.083.71.168 1.146c.045.23.09.444.123.596c-.652.666-1.098 1.263-1.339 1.756c-.277.567-.208.825-.145.925c.072.116.305.305.937.38c.609.073 1.44.018 2.455-.183c2.02-.4 4.613-1.351 7.28-2.772c2.667-1.42 4.85-3.015 6.23-4.423c.694-.707 1.15-1.334 1.377-1.836c.233-.515.167-.75.107-.844c-.07-.112-.289-.294-.883-.374c-.542-.072-1.272-.041-2.163.112L16.87 5.656c.338-.101.658-.17.842-.203" /></svg>
                        </Link>
                        <Link className="nav-item" title="博客" href="/" style={{ color: "#3DC550" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M5.879 2.879C5 3.757 5 5.172 5 8v8c0 2.828 0 4.243.879 5.121C6.757 22 8.172 22 11 22h2c2.828 0 4.243 0 5.121-.879C19 20.243 19 18.828 19 16V8c0-2.828 0-4.243-.879-5.121C17.243 2 15.828 2 13 2h-2c-2.828 0-4.243 0-5.121.879M8.25 17a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75M9 12.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5zM8.25 9A.75.75 0 0 1 9 8.25h6a.75.75 0 0 1 0 1.5H9A.75.75 0 0 1 8.25 9" clipRule="evenodd" /><path fill="currentColor" d="M5.235 4.058C5 4.941 5 6.177 5 8v8c0 1.823 0 3.058.235 3.942L5 19.924c-.975-.096-1.631-.313-2.121-.803C2 18.243 2 16.828 2 14v-4c0-2.829 0-4.243.879-5.121c.49-.49 1.146-.707 2.121-.803zm13.53 15.884C19 19.058 19 17.822 19 16V8c0-1.823 0-3.059-.235-3.942l.235.018c.975.096 1.631.313 2.121.803C22 5.757 22 7.17 22 9.999v4c0 2.83 0 4.243-.879 5.122c-.49.49-1.146.707-2.121.803z" opacity=".5" /></svg>
                        </Link>
                        <Link className="nav-item" title="归档" href="/archives" style={{ color: "#FA6400" }}>
                            <svg style={{ marginBottom: "2px" }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 2c.416 0 .753.324.753.724v1.46c.668-.012 1.417-.012 2.26-.012h4.015c.842 0 1.591 0 2.259.013v-1.46c0-.4.337-.725.753-.725s.753.324.753.724V4.25c1.445.111 2.394.384 3.09 1.055c.698.67.982 1.582 1.097 2.972L22 9H2v-.724c.116-1.39.4-2.302 1.097-2.972c.697-.67 1.645-.944 3.09-1.055V2.724c0-.4.337-.724.753-.724" /><path fill="currentColor" d="M22 14v-2c0-.839-.004-2.335-.017-3H2.01c-.013.665-.01 2.161-.01 3v2c0 3.771 0 5.657 1.172 6.828C4.343 22 6.228 22 10 22h4c3.77 0 5.656 0 6.828-1.172C22 19.658 22 17.772 22 14" opacity=".5" /><path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0" /></svg>
                        </Link>
                        <Link className="nav-item" title="关于" href="/about" style={{ color: "#F44336" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m13.629 20.472l-.542.916c-.483.816-1.69.816-2.174 0l-.542-.916c-.42-.71-.63-1.066-.968-1.262c-.338-.197-.763-.204-1.613-.219c-1.256-.021-2.043-.098-2.703-.372a5 5 0 0 1-2.706-2.706C2 14.995 2 13.83 2 11.5v-1c0-3.273 0-4.91.737-6.112a5 5 0 0 1 1.65-1.651C5.59 2 7.228 2 10.5 2h3c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C22 5.59 22 7.228 22 10.5v1c0 2.33 0 3.495-.38 4.413a5 5 0 0 1-2.707 2.706c-.66.274-1.447.35-2.703.372c-.85.015-1.275.022-1.613.219c-.338.196-.548.551-.968 1.262" opacity=".5" /><path fill="currentColor" d="M10.99 14.308c-1.327-.978-3.49-2.84-3.49-4.593c0-2.677 2.475-3.677 4.5-1.609c2.025-2.068 4.5-1.068 4.5 1.609c0 1.752-2.163 3.615-3.49 4.593c-.454.335-.681.502-1.01.502c-.329 0-.556-.167-1.01-.502" /></svg>
                        </Link>

                        <ThemeToggle />
                    </nav>
                </div>

                <div className="widgets">
                    <div className="widget-wrapper recent post-list">
                        <div className="widget-header dis-select"><span className="name">最近更新</span></div>
                        <div className="widget-body fs14">
                            <Link className="item title" href="/hello-world">
                                <span className="title">你好，世界</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </aside>
    );
}
