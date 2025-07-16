
import React from "react";
import { Contact, contactService } from "@/services/firestoreService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, MapPin, Phone, Mail, Building, Tag, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface EnhancedContactCardProps {
  contact: Contact;
  onStatusChange: (contactId: string, newStatus: Contact['status']) => void;
  onDelete?: () => void;
}

const EnhancedContactCard: React.FC<EnhancedContactCardProps> = ({
  contact,
  onStatusChange,
  onDelete
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Prospect": return "bg-blue-100 text-blue-800";
      case "Negotiation": return "bg-yellow-100 text-yellow-800";
      case "Won": return "bg-green-100 text-green-800";
      case "Lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "Website": return "bg-purple-100 text-purple-800";
      case "Referral": return "bg-green-100 text-green-800";
      case "Outreach": return "bg-blue-100 text-blue-800";
      case "Cold Call": return "bg-orange-100 text-orange-800";
      case "Inbound": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async () => {
    if (!user || !contact.id) return;
    
    if (!confirm(`Are you sure you want to delete ${contact.name} and all linked deals, projects, and tasks?`)) {
      return;
    }

    try {
      await contactService.delete(contact.id);
      toast({
        title: "Contact deleted",
        description: `${contact.name} and all linked records have been removed.`,
      });
      if (onDelete) onDelete();
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{contact.name}</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(contact.status)}>
            {contact.status}
          </Badge>
          {contact.source && (
            <Badge variant="outline" className={getSourceColor(contact.source)}>
              {contact.source}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>{contact.company_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{contact.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{contact.phone}</span>
          </div>

          {contact.designation && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Role:</span> {contact.designation}
            </div>
          )}

          {contact.industry && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Industry:</span> {contact.industry}
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Tag className="w-4 h-4" />
              <span className="font-medium">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Last Activity */}
        {contact.last_activity && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Last activity: {format(contact.last_activity.toDate(), "MMM dd, yyyy")}</span>
          </div>
        )}

        {/* Status Changer */}
        <div className="pt-2 border-t">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Change Status:
          </label>
          <Select
            value={contact.status}
            onValueChange={(value) => onStatusChange(contact.id!, value as Contact['status'])}
          >
            <SelectTrigger className="w-full">
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

        {/* Notes */}
        {contact.notes && (
          <div className="pt-2 border-t">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-xs">{contact.notes}</p>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        {contact.status_timeline && contact.status_timeline.length > 1 && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-gray-700 mb-2">Status History:</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {contact.status_timeline.slice(-3).reverse().map((timeline, index) => (
                <div key={index} className="text-xs text-gray-500 flex justify-between">
                  <span>{timeline.status}</span>
                  <span>{format(timeline.changed_at.toDate(), "MMM dd")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedContactCard;
