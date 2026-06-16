import Link from "next/link";
import { Boxes, ClipboardList, LayoutDashboard, PackagePlus } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: PackagePlus },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes }
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} className="button-secondary">
            <Icon aria-hidden className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <LogoutButton />
    </nav>
  );
}
