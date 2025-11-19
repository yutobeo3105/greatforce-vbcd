"use client";

import * as React from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { NotesSection } from "~/components/notes-section";
import { TagsSection } from "~/components/tags-section";
import { FilesSection } from "~/components/files-section";
import { CustomFieldsSection } from "~/components/custom-fields-section";
import { CommentsSection } from "~/components/comments-section";
import { Mail, Phone, Building2, Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { data: contact, isLoading } = api.contact.getById.useQuery({
    id: resolvedParams.id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8">Loading...</div>
      </AppLayout>
    );
  }

  if (!contact) {
    return (
      <AppLayout>
        <div className="p-8">Contact not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {contact.firstName} {contact.lastName}
            </h2>
            <p className="text-muted-foreground">{contact.title}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}

              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.company.name}</span>
                </div>
              )}

              {contact.title && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.title}</span>
                </div>
              )}

              {contact.tags && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {contact.tags.split(",").map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="notes" className="w-full">
              <TabsList>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="custom">Custom Fields</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="deals">Deals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes" className="mt-6">
                <NotesSection entityType="Contact" entityId={contact.id} />
              </TabsContent>
              
              <TabsContent value="comments" className="mt-6">
                <CommentsSection entityType="CONTACT" entityId={contact.id} />
              </TabsContent>
              
              <TabsContent value="tags" className="mt-6">
                <TagsSection entityType="Contact" entityId={contact.id} />
              </TabsContent>
              
              <TabsContent value="files" className="mt-6">
                <FilesSection entityType="Contact" entityId={contact.id} />
              </TabsContent>
              
              <TabsContent value="custom" className="mt-6">
                <CustomFieldsSection entityType="Contact" entityId={contact.id} />
              </TabsContent>
              
              <TabsContent value="activities" className="mt-6">
                <div className="space-y-3">
                  {contact.activities && contact.activities.length > 0 ? (
                    contact.activities.map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.type}
                            </p>
                          </div>
                          <Badge
                            variant={activity.completed ? "secondary" : "default"}
                          >
                            {activity.completed ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No activities yet
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="deals" className="mt-6">
                <div className="space-y-3">
                  {contact.deals && contact.deals.length > 0 ? (
                    contact.deals.map((deal) => (
                      <Card key={deal.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{deal.title}</p>
                            <p className="text-sm text-muted-foreground">
                              ${deal.value.toLocaleString()}
                            </p>
                          </div>
                          <Badge>{deal.stage}</Badge>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No deals yet
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
