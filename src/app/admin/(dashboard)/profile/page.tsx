import { auth } from "@/auth";

export default async function ProfilePage() {
    const session = await auth();
    const user = session?.user;

    return (
        <div style={{ paddingBottom: '40px' }}>
            <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '24px',
                color: 'var(--admin-text-main)'
            }}>
                个人中心
            </h1>

            <div style={{
                maxWidth: '800px',
                background: 'var(--admin-card)',
                borderRadius: '12px',
                padding: '30px',
                border: '1px solid var(--admin-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--admin-border)' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'var(--admin-bg)',
                        border: '4px solid white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        {user?.image ? (
                            <img src={user.image} alt={user.name || "User"} width="100" height="100" style={{ objectFit: "cover", width: '100%', height: '100%' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: 'var(--admin-text-sub)' }}>
                                {(user?.name?.[0] || "A").toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: 'var(--admin-text-main)' }}>{user?.name || '管理员'}</h2>
                        <p style={{ color: 'var(--admin-text-sub)', fontSize: '14px' }}>{user?.email || '暂无邮箱'}</p>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <span style={{
                                padding: '2px 8px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                超级管理员
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--admin-text-main)' }}>账户信息</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <InfoItem label="用户 ID" value={user?.id || 'admin-001'} />
                        <InfoItem label="注册时间" value="2023-10-01" />
                        <InfoItem label="最后登录" value="刚刚" />
                        <InfoItem label="登录 IP" value="127.0.0.1" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-sub)', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '14px', color: 'var(--admin-text-main)', fontWeight: '500' }}>{value}</div>
        </div>
    );
}
