import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "/",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "test",
    icon: Search,
  },
  {
    title: "Settings",
    url: "test",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0"> {/* Remove a borda padrão para um visual limpo */}
      <SidebarContent className="bg-yevox-primary text-white p-4"> {/* Fundo dinâmico Yevox */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 font-bold mb-4">
            Yevox Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2"> {/* Espaçamento entre itens como na imagem */}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="hover:bg-white/10 active:bg-white/20 rounded-full h-10 transition-colors"
                  >
                    <a href={item.url} className="flex items-center gap-3 text-white">
                      <item.icon className="size-5" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Espaçador para empurrar o item de ajuda para baixo */}
        <div className="mt-auto pb-4">
           <SidebarMenuButton className="bg-white/20 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <span className="text-xl font-bold">?</span>
           </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}