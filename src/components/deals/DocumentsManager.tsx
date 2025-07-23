import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { dealService } from "@/services/firestoreService";

interface Document {
  id: string;
  fileName: string;
  companyName: string;
  dealName: string;
  documentType: 'proposal' | 'quotation';
  uploadDate: string;
  dealId: string;
}

const DocumentsManager: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, selectedCompany]);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get all deals to extract document information
      const deals = await dealService.getAll(user.user_id);
      
      // For demo purposes, create mock documents based on deals
      // In real implementation, you'd fetch from your document storage
      const mockDocuments: Document[] = deals.flatMap(deal => {
        const docs: Document[] = [];
        // Add proposal document if deal has advanced stages
        if (['Proposal Sent', 'Negotiation', 'Won'].includes(deal.deal_stage)) {
          docs.push({
            id: `${deal.id}_proposal`,
            fileName: `${deal.deal_name}_Proposal.pdf`,
            companyName: deal.company_name,
            dealName: deal.deal_name,
            documentType: 'proposal',
            uploadDate: new Date().toISOString().split('T')[0],
            dealId: deal.id!,
          });
        }
        // Add quotation document if deal is in negotiation or won
        if (['Negotiation', 'Won'].includes(deal.deal_stage)) {
          docs.push({
            id: `${deal.id}_quotation`,
            fileName: `${deal.deal_name}_Quotation.pdf`,
            companyName: deal.company_name,
            dealName: deal.deal_name,
            documentType: 'quotation',
            uploadDate: new Date().toISOString().split('T')[0],
            dealId: deal.id!,
          });
        }
        return docs;
      });

      setDocuments(mockDocuments);
      
      // Extract unique company names
      const uniqueCompanies = Array.from(new Set(deals.map(deal => deal.company_name)));
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = documents;

    // Filter by company
    if (selectedCompany !== "all") {
      filtered = filtered.filter(doc => doc.companyName === selectedCompany);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.dealName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'proposal': return 'bg-blue-100 text-blue-800';
      case 'quotation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (document: Document) => {
    // In real implementation, you'd download from OneDrive or your storage
    console.log('Download document:', document);
    // For demo, just show a message
    alert(`Downloading ${document.fileName} - This would download from OneDrive in a real implementation`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Badge variant="outline" className="text-sm">
          {filteredDocuments.length} documents
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents, companies, or deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {documents.length === 0 
                  ? "Upload documents from the deals page to see them here."
                  : "Try adjusting your filters to see more documents."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map(document => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{document.fileName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{document.companyName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{document.dealName}</span>
                        <Badge className={getDocumentTypeColor(document.documentType)}>
                          {document.documentType}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded on {document.uploadDate}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsManager;