
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactService, type Contact } from "@/services/firestoreService";
import { 
  Phone, 
  Mail, 
  Building, 
  Tag, 
  Calendar, 
  Trash2,
  User,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedContactCardProps {
  contact: Contact;
  onStatusChange: (contactId: string, newStatus: Contact['status']) => void;
  onDelete: () => void;
  onClick?: () => void;
}

const EnhancedContactCard: React.FC<EnhancedContactCardProps> = ({ 
  contact, 
  onStatusChange, 
  onDelete,
  onClick 
}) => {
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!confirm(`Are you sure you want to delete ${contact.name}? This will also remove all linked deals, projects, and tasks.`)) {
      return;
    }

    try {
      await contactService.delete(contact.id!);
      onDelete();
      toast({
        title: "Contact deleted",
        description: `${contact.name} and all linked records have been removed.`,
      });
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation(); // Prevent card click
    onStatusChange(contact.id!, newStatus as Contact['status']);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'Prospect': return 'bg-blue-100 text-blue-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'Website': return 'bg-purple-100 text-purple-800';
      case 'Referral': return 'bg-green-100 text-green-800';
      case 'Outreach': return 'bg-blue-100 text-blue-800';
      case 'Cold Call': return 'bg-orange-100 text-orange-800';
      case 'Inbound': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {contact.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Building className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{contact.company_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge className={getStatusColor(contact.status)}>
              {contact.status}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-600 text-sm">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{contact.phone}</span>
          </div>

          {contact.designation && (
            <div className="flex items-center text-gray-600 text-sm">
              <User className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{contact.designation}</span>
            </div>
          )}

          {contact.industry && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{contact.industry}</span>
            </div>
          )}
        </div>

        {/* Source & Tags */}
        <div className="mt-4 space-y-2">
          {contact.source && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Source:</span>
              <Badge variant="outline" className={getSourceColor(contact.source)}>
                {contact.source}
              </Badge>
            </div>
          )}

          {contact.tags && contact.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {contact.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {contact.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{contact.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Change & Last Activity */}
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>
              {contact.last_activity 
                ? `Last activity: ${contact.last_activity.toDate().toLocaleDateString()}`
                : `Created: ${contact.createdAt?.toDate().toLocaleDateString()}`
              }
            </span>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={contact.status}
              onValueChange={(value) => handleStatusChange(new MouseEvent('click') as any, value)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prospect">Prospect</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Won">Won</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes Preview */}
        {contact.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <p className="line-clamp-2">{contact.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedContactCard;
