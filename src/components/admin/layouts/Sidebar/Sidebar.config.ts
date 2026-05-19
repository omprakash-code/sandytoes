import {
  LayoutDashboard,
  CalendarCheck,
  Activity,
  Settings,
  User,
} from "@/components/icons";

export const sidebarMenu = [
  {
    label: "Main Menu",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { name: "Calendar", href: "/admin/calendar", icon: Activity },
    ],
  },
  {
    label: "Admin System",
    items: [
      { name: "Profile", href: "/admin/profile", icon: User },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];
