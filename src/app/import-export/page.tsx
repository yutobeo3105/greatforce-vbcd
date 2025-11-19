"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Download, Upload, FileSpreadsheet, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { AppLayout } from "~/components/app-layout";
import { useToast } from "~/hooks/use-toast";

export default function ImportExportPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("contacts");
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [importData, setImportData] = useState("");
  const [importResult, setImportResult] = useState<any>(null);

  const exportContactsMutation = api.importExport.exportContacts.useQuery(
    { format, filters: {} },
    { enabled: false }
  );

  const exportCompaniesMutation = api.importExport.exportCompanies.useQuery(
    { format },
    { enabled: false }
  );

  const exportDealsMutation = api.importExport.exportDeals.useQuery(
    { format, filters: {} },
    { enabled: false }
  );

  const importContactsMutation = api.importExport.importContacts.useMutation({
    onSuccess: (data) => {
      setImportResult(data);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.created} contacts. ${data.errors} errors.`,
      });
      setImportData("");
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importCompaniesMutation = api.importExport.importCompanies.useMutation({
    onSuccess: (data) => {
      setImportResult(data);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.created} companies. ${data.errors} errors.`,
      });
      setImportData("");
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importDealsMutation = api.importExport.importDeals.useMutation({
    onSuccess: (data) => {
      setImportResult(data);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.created} deals. ${data.errors} errors.`,
      });
      setImportData("");
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExport = async () => {
    try {
      let data: string = "";
      
      if (activeTab === "contacts") {
        await exportContactsMutation.refetch();
        data = exportContactsMutation.data || "";
      } else if (activeTab === "companies") {
        await exportCompaniesMutation.refetch();
        data = exportCompaniesMutation.data || "";
      } else if (activeTab === "deals") {
        await exportDealsMutation.refetch();
        data = exportDealsMutation.data || "";
      }

      if (data) {
        const blob = new Blob([data], { 
          type: format === "csv" ? "text/csv" : "application/json" 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeTab}-export.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `${activeTab} exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste data to import",
        variant: "destructive",
      });
      return;
    }

    setImportResult(null);

    if (activeTab === "contacts") {
      importContactsMutation.mutate({ data: importData, format });
    } else if (activeTab === "companies") {
      importCompaniesMutation.mutate({ data: importData, format });
    } else if (activeTab === "deals") {
      importDealsMutation.mutate({ data: importData, format });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const getTemplateData = () => {
    if (activeTab === "contacts") {
      return format === "csv" 
        ? "firstName,lastName,email,phone,jobTitle,status,company\nJohn,Doe,john@example.com,555-0100,Manager,ACTIVE,Acme Corp"
        : JSON.stringify([{
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "555-0100",
            jobTitle: "Manager",
            status: "ACTIVE",
            company: "Acme Corp"
          }], null, 2);
    } else if (activeTab === "companies") {
      return format === "csv"
        ? "name,industry,website,phone,address\nAcme Corp,Technology,https://acme.com,555-0100,123 Main St"
        : JSON.stringify([{
            name: "Acme Corp",
            industry: "Technology",
            website: "https://acme.com",
            phone: "555-0100",
            address: "123 Main St"
          }], null, 2);
    } else {
      return format === "csv"
        ? "title,value,stage,probability,expectedCloseDate,contactEmail,company\nBig Deal,50000,PROPOSAL,75,2024-12-31,john@example.com,Acme Corp"
        : JSON.stringify([{
            title: "Big Deal",
            value: 50000,
            stage: "PROPOSAL",
            probability: 75,
            expectedCloseDate: "2024-12-31",
            contactEmail: "john@example.com",
            company: "Acme Corp"
          }], null, 2);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Import/Export</h2>
          <p className="text-muted-foreground">
            Import and export your CRM data in CSV or JSON format
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export {activeTab}
                  </CardTitle>
                  <CardDescription>
                    Download your {activeTab} data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={format} onValueChange={(v: "csv" | "json") => setFormat(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            CSV
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <FileJson className="h-4 w-4" />
                            JSON
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleExport}
                    className="w-full"
                    disabled={exportContactsMutation.isFetching || exportCompaniesMutation.isFetching || exportDealsMutation.isFetching}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as {format.toUpperCase()}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import {activeTab}
                  </CardTitle>
                  <CardDescription>
                    Upload {activeTab} data from CSV or JSON
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={format} onValueChange={(v: "csv" | "json") => setFormat(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            CSV
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <FileJson className="h-4 w-4" />
                            JSON
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <input
                      type="file"
                      accept={format === "csv" ? ".csv" : ".json"}
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Or Paste Data</Label>
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder={`Paste ${format.toUpperCase()} data here...`}
                      rows={6}
                    />
                  </div>

                  <Button 
                    onClick={handleImport}
                    className="w-full"
                    disabled={importContactsMutation.isPending || importCompaniesMutation.isPending || importDealsMutation.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import {activeTab}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {importResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {importResult.errors === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    Import Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="text-2xl font-bold text-green-600">{importResult.created}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                      <div className="text-2xl font-bold text-red-600">{importResult.errors}</div>
                    </div>
                  </div>

                  {importResult.errorDetails && importResult.errorDetails.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Error Details:</div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {importResult.errorDetails.map((error: any, idx: number) => (
                          <div key={idx} className="p-2 bg-destructive/10 rounded text-sm">
                            <div className="font-medium">Row {idx + 1}:</div>
                            <div className="text-muted-foreground">{error.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Template & Format Guide</CardTitle>
                <CardDescription>
                  Use this template as a reference for your {format.toUpperCase()} file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                  {getTemplateData()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
