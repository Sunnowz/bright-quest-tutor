import { useUserRole } from "@/hooks/useUserRole";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboards/TeacherDashboard";
import { ParentDashboard } from "@/components/dashboards/ParentDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

const Index = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        Загрузка...
      </div>
    );
  }

  switch (role) {
    case "teacher":
      return <TeacherDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Index;
