import { BookOpen, Brain, Gamepad2, User, Home, Users, Settings, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useUserRole, type AppRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type MenuItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const menusByRole: Record<AppRole, MenuItem[]> = {
  student: [
    { title: "Главная", url: "/", icon: Home },
    { title: "ИИ-Тьютор", url: "/tutor", icon: Brain },
    { title: "Конспекты", url: "/notes", icon: BookOpen },
    { title: "Задачи", url: "/tasks", icon: Gamepad2 },
    { title: "Профиль", url: "/profile", icon: User },
  ],
  teacher: [
    { title: "Главная", url: "/", icon: Home },
    { title: "ИИ-Тьютор", url: "/tutor", icon: Brain },
    { title: "Конспекты", url: "/notes", icon: BookOpen },
    { title: "Задачи", url: "/tasks", icon: Gamepad2 },
    { title: "Ученики", url: "/students", icon: Users },
    { title: "Профиль", url: "/profile", icon: User },
  ],
  parent: [
    { title: "Главная", url: "/", icon: Home },
    { title: "Прогресс", url: "/progress", icon: BarChart3 },
    { title: "Профиль", url: "/profile", icon: User },
  ],
  admin: [
    { title: "Главная", url: "/", icon: Home },
    { title: "Пользователи", url: "/admin/users", icon: Users },
    { title: "Статистика", url: "/admin/stats", icon: BarChart3 },
    { title: "Настройки", url: "/admin/settings", icon: Settings },
    { title: "Профиль", url: "/profile", icon: User },
  ],
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useUserRole();

  const items = menusByRole[role ?? "student"];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary">🎓 ЭдуТьютор</h1>
          )}
          {collapsed && <span className="text-xl">🎓</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Меню</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/50"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
