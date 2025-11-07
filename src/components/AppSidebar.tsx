import { LayoutDashboard, Users, Stethoscope, UserCog, Shield, Hospital, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { userRole, signOut, user } = useAuth();

  const getMenuItems = () => {
    if (userRole === "patient") {
      return [
        { title: "My Portal", url: "/patient-portal", icon: Hospital },
      ];
    }

    const baseItems = [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Patients", url: "/patients", icon: Users },
      { title: "Doctors", url: "/doctors", icon: Stethoscope },
    ];

    if (userRole === "admin") {
      baseItems.push(
        { title: "Staff", url: "/staff", icon: UserCog },
        { title: "Admin Panel", url: "/admin", icon: Shield }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Hospital className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-sidebar-foreground">Hospital MS</span>
          </div>
        )}
        {collapsed && (
          <Hospital className="h-6 w-6 text-primary mx-auto" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className={collapsed ? "mx-auto" : "mr-2 h-4 w-4"} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className={collapsed ? "mx-auto h-4 w-4" : "mr-2 h-4 w-4"} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}