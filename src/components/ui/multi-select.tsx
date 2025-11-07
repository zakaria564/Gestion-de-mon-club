
"use client"

import * as React from "react"
import { Check, X, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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

export type MultiSelectOption = {
  value: string
  label: string
  group?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  creatable?: boolean
  formatCreateLabel?: (inputValue: string, group?: string) => React.ReactNode
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  creatable = false,
  formatCreateLabel = (inputValue) => `Ajouter "${inputValue}"`,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (item: string) => {
    const newValues = [...value];
    const itemIndex = newValues.lastIndexOf(item);
    if (itemIndex > -1) {
      newValues.splice(itemIndex, 1);
      onChange(newValues);
    }
  }
  
  const handleSelect = (newValue: string) => {
      onChange([...value, newValue]);
      setInputValue("");
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && inputValue) {
      if (creatable) {
        e.preventDefault();
        // This is a simple creation, more complex logic should be handled by onSelect with a special value
        if (!options.some(option => option.value.toLowerCase() === inputValue.toLowerCase())) {
          handleSelect(inputValue);
        }
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, value.length - 1));
    }
  }
  
  const selectedOptions = value.map(val => {
    return options.find(opt => opt.value === val) || { value: val, label: val, group: "Saisie manuelle" }
  }).filter(Boolean) as MultiSelectOption[];

  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || "Autres";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, MultiSelectOption[]>);
  
  const filteredOptions = Object.keys(groupedOptions).reduce((acc, group) => {
    const filtered = groupedOptions[group].filter(opt =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()) || opt.value.startsWith('create-')
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as Record<string, MultiSelectOption[]>);

  const getLabelForValue = (val: string) => {
    const option = options.find(opt => opt.value === val);
    if (option) return option.label;
    
    // Handle formatted strings like "Player Name (Team Name)"
    const match = val.match(/(.*) \((.*)\)/);
    if (match) return match[1];

    return val;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center min-h-10 px-3 py-2",
            className
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {value.length > 0 ? (
              value.map((val, index) => (
                <Badge
                  variant="secondary"
                  key={`${val}-${index}`}
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(val);
                  }}
                >
                  {getLabelForValue(val)}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder="Rechercher ou créer..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              Aucun résultat trouvé.
            </CommandEmpty>
            {Object.entries(filteredOptions).map(([group, groupOptions]) => (
              <CommandGroup key={group} heading={group}>
                {groupOptions.map((option) => {
                  if (option.value.startsWith('create-')) {
                    if (!inputValue) return null;
                    return (
                       <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const newValue = `${inputValue} (${group})`;
                          handleSelect(newValue);
                        }}
                        className="cursor-pointer"
                      >
                       {formatCreateLabel(inputValue, group)}
                      </CommandItem>
                    )
                  }

                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        handleSelect(option.value);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
