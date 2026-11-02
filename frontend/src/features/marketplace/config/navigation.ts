import { BookOpen, ChartNoAxesCombined, CircleHelp, FileText, House, Info, LayoutGrid, Map, Network, Route, Shield, UserRound } from 'lucide-react'

export const primaryNav = [
    { label: "Bütün elanlar", icon: House },
    { label: "Mənim elanlarım", icon: LayoutGrid },
    { label: "Yük xəritəsi", icon: Map },
    { label: "Marşrutlarım", icon: Route },
    { label: "Xidmətlərimiz", icon: Network },
    { label: "Tariflər və Analitika", icon: ChartNoAxesCombined },
    { label: "Sənədlər", icon: FileText },
    { label: "Bilik bazası", icon: BookOpen },
    { label: "Profil", icon: UserRound },
];
export const secondaryNav = [
    { label: "Platforma haqqında", icon: Info },
    { label: "İstifadə şərtləri", icon: FileText },
    { label: "Məxfilik Siyasəti", icon: Shield },
    { label: "Kömək", icon: CircleHelp },
];

export const pagePaths: Record<string, string> = {
    "Bütün elanlar": "/",
    "Mənim elanlarım": "/my/loads",
    "Yük xəritəsi": "/map",
    "Marşrutlarım": "/my/offers",
    "Xidmətlərimiz": "/services",
    "Tariflər və Analitika": "/pricing-analytics",
    "Sənədlər": "/documents",
    "Bilik bazası": "/knowledge-base",
    "Profil": "/profile",
    "Platforma haqqında": "/about",
    "İstifadə şərtləri": "/terms",
    "Məxfilik Siyasəti": "/privacy",
    "Kömək": "/help",
    "Yadda saxlanılanlar": "/saved",
    "Mesajlar": "/messages",
}
