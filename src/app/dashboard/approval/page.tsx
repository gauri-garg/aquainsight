import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { datasets } from "@/lib/data";
import { Check, Download, X } from "lucide-react";

export default function ApprovalPage() {
  const pendingDatasets = datasets.filter(
    (d) => d.status === "Pending" || d.status === "Rejected"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Submissions Review</CardTitle>
        <CardDescription>
          Review, approve, or reject datasets submitted by researchers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dataset Name</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingDatasets.map((dataset) => (
              <TableRow key={dataset.id}>
                <TableCell className="font-medium">{dataset.name}</TableCell>
                <TableCell>{dataset.submittedBy}</TableCell>
                <TableCell>{dataset.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      dataset.status === "Pending" ? "secondary" : "destructive"
                    }
                  >
                    {dataset.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-2" />
                      View Data
                    </Button>
                    {dataset.status === "Pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
