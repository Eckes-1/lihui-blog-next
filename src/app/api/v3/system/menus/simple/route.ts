
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET() {
    const menus = [
        {
            path: '/dashboard',
            component: 'LAYOUT',
            redirect: '/dashboard/console',
            meta: {
                title: '工作台',
                icon: 'ri:dashboard-line',
            },
            children: [
                {
                    path: 'console',
                    name: 'Console',
                    component: '/dashboard/console/index',
                    meta: {
                        title: '主控台',
                        icon: 'ri:dashboard-line',
                        affix: true,
                    },
                },
            ],
        },
        {
            path: '/article',
            component: 'LAYOUT',
            redirect: '/article/list',
            meta: {
                title: '文章管理',
                icon: 'ri:article-line',
            },
            children: [
                {
                    path: 'list',
                    name: 'ArticleList',
                    // We need to create this view in Vue side later, but for now map to something existing or hold
                    component: '/article/list/index',
                    meta: {
                        title: '文章列表',
                        icon: 'ri:list-unordered',
                    },
                },
                {
                    path: 'create',
                    name: 'ArticleCreate',
                    component: '/article/create/index',
                    meta: {
                        title: '发布文章',
                        icon: 'ri:edit-line',
                    },
                },
            ],
        },
        {
            path: '/system',
            component: 'LAYOUT',
            redirect: '/system/user',
            meta: {
                title: '系统管理',
                icon: 'ri:settings-3-line',
            },
            children: [
                {
                    path: 'user',
                    name: 'SystemUser',
                    component: '/system/user/index',
                    meta: {
                        title: '用户管理',
                        icon: 'ri:user-settings-line',
                    },
                },
            ],
        },
    ];

    return NextResponse.json({
        code: 200,
        msg: 'success',
        data: menus,
    });
}
