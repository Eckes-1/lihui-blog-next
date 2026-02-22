import Link from "next/link";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import SidebarControl from "./components/SidebarControl";

export default function NotFound() {
    return (
        <>
            <div className="sitebg">
                <div className="siteblur"></div>
            </div>
            <div className="l_body index" id="start">
                <LeftSidebar />

                <div className="l_main" id="main">
                    <article className="md-text error-page">
                        <h1>
                            <img
                                id="error"
                                src="https://gcore.jsdelivr.net/gh/cdn-x/placeholder@1.0.12/404/1c830bfcd517d.svg"
                                alt="404"
                            />
                        </h1>
                        <p className="what">
                            <strong>很抱歉，您访问的页面不存在</strong>
                        </p>
                        <p className="why">可能是输入地址有误或该地址已被删除</p>
                        <br /><br />
                        <Link className="button" id="back" href="/">
                            返回主页
                        </Link>
                    </article>

                    <footer className="page-footer footnote">
                        <hr />
                        <div className="text">
                            <p>
                                本站由 <Link href="/">LIHUI</Link> 使用 Next.js 重构。
                                <br />
                                UI 复刻自 Stellar 主题。
                            </p>
                        </div>
                    </footer>
                </div>

                <RightSidebar />
                <SidebarControl />
            </div>
        </>
    );
}
