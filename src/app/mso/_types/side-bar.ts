export interface SideBarProps {
    folded: boolean;
}

export interface SubMenuItem {
    title: string;
    href: string;
}

export interface NavigationItemProps {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    hasSubmenu?: boolean;
    submenu?: SubMenuItem[];
    folded: boolean;
    isActive: boolean;
    isExpanded: boolean;
    pathname: string;
    onToggle: (id: string) => void;
    onPrefetch: (href: string) => void;
}

export interface SideBarItem {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    hasSubmenu?: boolean;
    submenu?: SubMenuItem[];
}