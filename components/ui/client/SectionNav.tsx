'use client'

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { professionTags } from "@/types";

const sectionItems = professionTags;

type SectionNavProps = {
  selectedSection: string;
  onSelect: (id: string) => void;
};

export default function SectionNav({ selectedSection, onSelect }: SectionNavProps) {
  return (
    <ul className="flex w-full gap-x-2">
      {sectionItems.map((item) => (
        <li key={item.id}>
          <Button
            variant={selectedSection === item.id ? "default" : "outline"}
            size="default"
            className={cn(
              "px-6 transition-colors",
              selectedSection === item.id && "bg-blue-600 text-white hover:bg-blue-700"
            )}
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </Button>
        </li>
      ))}
    </ul>
  );
}