import AppSidebar from "@/components/app-sidebar";
import { OnboardingTour } from "@/components/onboarding-tour";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-accent/20">{children}</SidebarInset>
      <OnboardingTour />
    </SidebarProvider>
  );
};
export default Layout;
