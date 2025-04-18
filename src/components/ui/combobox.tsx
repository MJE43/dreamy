'use client'

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge" // Import Badge

interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  allowFreeText?: boolean; // Prop to allow adding non-listed tags
  className?: string;
}

export function Combobox({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  emptyPlaceholder = "No option found.",
  allowFreeText = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(""); // For free text input

  const handleSelect = (currentValue: string) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter((v) => v !== currentValue)
      : [...selected, currentValue];
    onChange(newSelected);
    setInputValue(""); // Clear input after selection/deselection
    // setOpen(false); // Keep open for multi-select
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (allowFreeText && event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      const newValue = inputValue.trim().toLowerCase();
      if (!selected.includes(newValue) && !options.some(opt => opt.value === newValue)) {
        onChange([...selected, newValue]);
      }
      setInputValue("");
    } else if (event.key === 'Backspace' && !inputValue && selected.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(selected.slice(0, -1));
    }
  }

  const handleRemove = (valueToRemove: string) => {
    onChange(selected.filter((v) => v !== valueToRemove));
  }

  const getLabel = (value: string) => {
    const option = options.find((option) => option.value === value);
    return option ? option.label : value; // Return label or the value itself for free text
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-[2.5rem]", className)}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="mr-1 mb-1 whitespace-nowrap"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRemove(value); }}
              >
                {getLabel(value)}
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRemove(value); }} />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
        <Command shouldFilter={!allowFreeText} // Disable internal filtering if using free text input
                 onKeyDown={handleKeyDown} // Handle Enter for free text
        >
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value} // Use value for CommandItem value
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 
