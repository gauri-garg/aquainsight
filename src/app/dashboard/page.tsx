
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-lg font-semibold md:text-2xl mb-4">Student & Researcher Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            This is the starting point for your dashboard. We will build this out together.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future components and features will be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
