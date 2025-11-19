"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";
import { Search, User, Building2, DollarSign, CalendarCheck, Loader2 } from "lucide-react";
import { Command } from "cmdk";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: results, isLoading } = api.search.global.useQuery(
    { query: searchQuery, limit: 5 },
    { enabled: searchQuery.length > 0 }
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    router.push(url);
    setSearchQuery("");
  };

  const totalResults =
    (results?.contacts.length ?? 0) +
    (results?.companies.length ?? 0) +
    (results?.deals.length ?? 0) +
    (results?.activities.length ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <Command className="rounded-lg border-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts, companies, deals..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </div>
          
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {searchQuery && !isLoading && totalResults === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found for &quot;{searchQuery}&quot;
              </Command.Empty>
            )}

            {results && results.contacts.length > 0 && (
              <Command.Group heading="Contacts" className="mb-2">
                {results.contacts.map((contact) => (
                  <Command.Item
                    key={contact.id}
                    value={contact.displayName}
                    onSelect={() => handleSelect(contact.url)}
                    className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-accent"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{contact.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.title} {contact.company && `at ${contact.company.name}`}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results && results.companies.length > 0 && (
              <Command.Group heading="Companies" className="mb-2">
                {results.companies.map((company) => (
                  <Command.Item
                    key={company.id}
                    value={company.displayName}
                    onSelect={() => handleSelect(company.url)}
                    className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-accent"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{company.displayName}</p>
                      <p className="text-xs text-muted-foreground">{company.industry}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results && results.deals.length > 0 && (
              <Command.Group heading="Deals" className="mb-2">
                {results.deals.map((deal) => (
                  <Command.Item
                    key={deal.id}
                    value={deal.displayName}
                    onSelect={() => handleSelect(deal.url)}
                    className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-accent"
                  >
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{deal.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        ${deal.value.toLocaleString()} • {deal.stage}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results && results.activities.length > 0 && (
              <Command.Group heading="Activities" className="mb-2">
                {results.activities.map((activity) => (
                  <Command.Item
                    key={activity.id}
                    value={activity.displayName}
                    onSelect={() => handleSelect(activity.url)}
                    className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-accent"
                  >
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.displayName}</p>
                      <p className="text-xs text-muted-foreground">{activity.type}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd> to open search
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
