import Link from "next/link";
import { ClipboardList, LayoutDashboard, UserRound } from "lucide-react";

const items = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: ClipboardList },
  { href: "/account/profile", label: "Profile", icon: UserRound }
];

export function AccountNav() {
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
    </nav>
  );
}
