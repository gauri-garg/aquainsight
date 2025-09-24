
"use client";

import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { role } = useAuth();

  const getTitle = () => {
    switch (role) {
      case "Student":
        return "Student Dashboard";
      case "Researcher":
        return "Researcher Dashboard";
      default:
        return "Dashboard";
    }
  };

  return (
    <div>
        <h1 className="text-lg font-semibold md:text-2xl">{getTitle()}</h1>
    </div>
  );
}
