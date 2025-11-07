
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
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type MultiSelectOption = {
  value: string
  label: string
  group?: string // e.g., Team Name
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  creatable?: boolean
  formatCreateLabel?: (inputValue: string) => React.ReactNode
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  creatable = false,
  formatCreateLabel,
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
  
  const handleCreate = (inputValue: string) => {
    if (creatable && inputValue) {
      let finalValue = inputValue;
      if (inputValue.includes('(') && inputValue.endsWith(')')) {
          // Already formatted
      } else if (inputValue.startsWith(newResult.homeTeam!) && newResult.matchType === 'opponent-vs-opponent') {
          const name = inputValue.substring(newResult.homeTeam!.length).trim();
          finalValue = `${name} (${newResult.homeTeam})`;
      } else if (inputValue.startsWith(newResult.awayTeam!) && newResult.matchType === 'opponent-vs-opponent') {
          const name = inputValue.substring(newResult.awayTeam!.length).trim();
          finalValue = `${name} (${newResult.awayTeam})`;
      }
      
      handleSelect(finalValue);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && inputValue) {
        if (creatable) {
            let finalValue = inputValue;
            
            const homeTeamPrefix = options.find(opt => opt.group && inputValue.startsWith(opt.group))?.group;
            
            if (homeTeamPrefix) {
                const name = inputValue.substring(homeTeamPrefix.length).trim();
                finalValue = `${name} (${homeTeamPrefix})`;
            }

            if (!options.some(option => option.value.toLowerCase() === finalValue.toLowerCase())) {
                handleSelect(finalValue);
            }
        }
        e.preventDefault();
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
      const filtered = groupedOptions[group].filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()));
      if(filtered.length > 0) {
          acc[group] = filtered;
      }
      return acc;
  }, {} as Record<string, MultiSelectOption[]>);


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
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option, index) => (
                <Badge
                  variant="secondary"
                  key={`${option.value}-${index}`}
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnselect(option.value)
                  }}
                >
                  {option.label}
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
             {creatable && inputValue ? (
                <CommandItem
                  onSelect={() => handleSelect(inputValue)}
                  className="cursor-pointer"
                >
                  {formatCreateLabel ? formatCreateLabel(inputValue) : `Ajouter "${inputValue}"`}
                </CommandItem>
              ) : (
                "Aucun résultat trouvé."
              )}
            </CommandEmpty>
             {Object.entries(filteredOptions).map(([group, groupOptions]) => (
                <CommandGroup key={group} heading={group}>
                    {groupOptions.map((option) => (
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
                    ))}
                </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
