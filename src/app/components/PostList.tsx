
import PostCard from "./PostCard";

const samplePosts = [
    {
        title: "你好，世界",
        excerpt: "欢迎来到我的全新动态博客！这是一个基于 Next.js 复刻的 Stellar 主题。",
        date: "2026-02-01",
        link: "/hello-world",
    },
    {
        title: "迁移进度汇报",
        excerpt: "全站样式已经完成了 90% 的复刻。",
        date: "2026-02-01",
        link: "/next-js-migration",
    },
];

export default function PostList() {
    return (
        <div className="post-list post">
            {samplePosts.map((post, index) => (
                <PostCard key={index} {...post} />
            ))}
        </div>
    );
}
