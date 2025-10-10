import { LucideIconData } from "lucide-angular";

export interface NavigationItem{
    id: string;
    label: string;
    icon: LucideIconData;
    description: string;
    badge: string | null;
    href?: string;
}