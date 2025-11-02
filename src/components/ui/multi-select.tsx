
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
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  creatable = false,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && inputValue && creatable) {
      if (!options.some(option => option.value === inputValue)) {
         onChange([...value, inputValue])
      }
      setInputValue("")
      e.preventDefault()
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        // Remove the last item on backspace
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
              {creatable ? `Appuyez sur Entrée pour ajouter "${inputValue}"` : "Aucun résultat trouvé."}
            </CommandEmpty>
             {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <CommandGroup key={group} heading={group}>
                    {groupOptions.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase())).map((option) => (
                        <CommandItem
                            key={option.value}
                            onSelect={() => {
                                onChange([...value, option.value])
                                setInputValue("")
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
