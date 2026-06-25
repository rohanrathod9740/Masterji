'use client'

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const sectionItems = [
  { name: 'Appointments', id: 'appointments' },
  { name: 'Commitments',  id: 'commitments'  },
  { name: 'Interactions', id: 'interactions' },
  { name: 'Clients',      id: 'clients'      },
];

type SectionNavProps = {
  selectedSection: string;
  onSelect: (id: string) => void;
};

export default function SectionNav({ selectedSection, onSelect }: SectionNavProps) {
  return (
    <Card className="w-full h-full border-2 flex flex-col">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
      Sections
    </CardTitle>
  </CardHeader>

  {/* Section List */}
  <div className="border-b p-3 pt-0">
    <ul className="flex flex-col gap-1">
      {sectionItems.map((item) => (
        <li key={item.id}>
          <Button
            variant={selectedSection === item.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start",
              selectedSection === item.id
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </Button>
        </li>
      ))}
    </ul>
  </div>

  {/* Filters */}
  <CardContent className="flex-1 overflow-auto p-3">
    <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
      Filters
    </h3>

    {selectedSection === "projects" && (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline">
          Active
        </Button>
        <Button size="sm" variant="outline">
          Archived
        </Button>
      </div>
    )}

    {selectedSection === "tasks" && (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline">
          Pending
        </Button>
        <Button size="sm" variant="outline">
          Completed
        </Button>
        <Button size="sm" variant="outline">
          High Priority
        </Button>
      </div>
    )}

    {selectedSection === "users" && (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline">
          Admin
        </Button>
        <Button size="sm" variant="outline">
          Members
        </Button>
      </div>
    )}
  </CardContent>
</Card>
  )};