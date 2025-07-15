
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { projectService, contactService } from "@/services/firestoreService";
import { toast } from "@/hooks/use-toast";
import { Timestamp } from 'firebase/firestore';

interface ExcelImportProps {
  onImportComplete: () => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImportComplete }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    console.log('📥 Excel upload started:', file.name);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      console.log('📊 Excel headers:', headers);

      // Get all contacts for matching
      const contacts = await contactService.getAll(user.user_id);
      console.log('👥 Available contacts for matching:', contacts.map(c => c.name));

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(r => r.trim());
        if (row.length < 3) continue;

        const projectName = row[0];
        const leadName = row[1];
        const status = row[2] as 'Active' | 'Completed';

        console.log(`📋 Processing row ${i}:`, { projectName, leadName, status });

        // Find matching contact
        const matchingContact = contacts.find(
          contact => contact.name.toLowerCase() === leadName.toLowerCase()
        );

        if (!matchingContact) {
          console.warn(`⚠️ Contact not found for lead: ${leadName}`);
          errorCount++;
          continue;
        }

        try {
          // Create project
          const projectData = {
            title: projectName,
            status: status,
            dealRef: `excel-import-${Date.now()}-${i}`, // Placeholder deal ref
            userRef: user.user_id
          };

          console.log('🔥 Creating project from Excel:', projectData);
          await projectService.create(projectData);
          successCount++;
          
          console.log(`✅ Project created successfully: ${projectName}`);
        } catch (error) {
          console.error(`❌ Failed to create project ${projectName}:`, error);
          errorCount++;
        }
      }

      console.log('📥 Excel import completed:', { successCount, errorCount });

      toast({
        title: "Excel Import Complete",
        description: `${successCount} projects imported successfully, ${errorCount} errors`,
      });

      onImportComplete();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Excel upload failed:', error);
      toast({
        title: "Import Failed",
        description: "Failed to process the Excel file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFileUpload}
        className="hidden"
        id="excel-upload"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Import Excel
      </Button>
    </div>
  );
};

export default ExcelImport;
