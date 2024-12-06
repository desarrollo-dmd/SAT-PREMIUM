import {
    Sidebar,
    SidebarProvider,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
  } from "../shadcn/sidebar"; // Asegúrate de importar correctamente los componentes de Sidebar
  import { Button } from "../shadcn/button";
  
  const AppSidebar = ({ fieldsNav, handleNavigation, handleLogout }) => {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              <SidebarMenu>
                {fieldsNav.map((item, index) => (
                  <SidebarMenuButton key={index} asChild>
                    <Button onClick={() => handleNavigation(item.path)}>
                      {item.name}
                    </Button>
                  </SidebarMenuButton>
                ))}
                <SidebarMenuButton asChild>
                  <Button onClick={handleLogout}>Logout</Button>
                </SidebarMenuButton>
              </SidebarMenu>
            </SidebarGroup>
          {/* Asegúrate de cerrar este SidebarGroup */}
        </SidebarContent>
      </Sidebar>
      </SidebarProvider>
    );
  };
  
  export default AppSidebar;
  