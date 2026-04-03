import { BookOpen, Brain, Gamepad2, User, Home } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const items = [
  { title: "Главная", url: "/", icon: Home },
  { title: "ИИ-Тьютор", url: "/tutor", icon: Brain },
  { title: "Конспекты", url: "/notes", icon: BookOpen },
  { title: "Задачи", url: "/tasks", icon: Gamepad2 },
  { title: "Профиль", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
