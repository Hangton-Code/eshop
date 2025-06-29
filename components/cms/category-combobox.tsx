"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const categories = [
  {
    value: "electronics",
    label: "Electronics",
  },
  {
    value: "apparel",
    label: "Apparel",
  },
  {
    value: "home_&_kitchen",
    label: "Home & Kitchen",
  },
  {
    value: "books_&_media",
    label: "Books & Media",
  },
  {
    value: "sports_&_outdoors",
    label: "Sports & Outdoors",
  },
  {
    value: "health_&_household",
    label: "Health & Household",
  },
  {
    value: "beauty_&_personal_care",
    label: "Beauty & Personal Care",
  },
  {
    value: "toys_&_games",
    label: "Toys & Games",
  },
  {
    value: "automotive",
    label: "Automotive",
  },
  {
    value: "pet_supplies",
    label: "Pet Supplies",
  },
  {
    value: "groceries",
    label: "Groceries",
  },
  {
    value: "jewelry",
    label: "Jewelry",
  },
  {
    value: "handmade",
    label: "Handmade",
  },
  {
    value: "industrial_&_scientific",
    label: "Industrial & Scientific",
  },
  {
    value: "other",
    label: "Other",
  },
];

type CategoryComboboxprops = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export function CategoryCombobox({ setValue, value }: CategoryComboboxprops) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? categories.find((category) => category.value === value)?.label
            : "Select category..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." className="h-9" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {category.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
