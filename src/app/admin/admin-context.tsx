"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    refreshKey: number;
    refreshContent: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children, user }: { children: React.ReactNode, user?: AdminContextType['user'] }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const refreshContent = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <AdminContext.Provider value={{ isCollapsed, toggleSidebar, user, refreshKey, refreshContent }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
