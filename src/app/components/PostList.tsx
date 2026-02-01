import PostCard from "./PostCard";

interface Post {
    title: string;
    excerpt: string;
    date: string;
    link: string;
}

export default function PostList({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="post-list post">
                <div className="post-card-wrap">
                    <article className="md-text">
                        <p style={{ textAlign: "center", padding: "20px", color: "var(--text-p3)" }}>暂无文章</p>
                    </article>
                </div>
            </div>
        );
    }
    return (
        <div className="post-list post">
            {posts.map((post, index) => (
                <PostCard key={index} {...post} />
            ))}
        </div>
    );
}
