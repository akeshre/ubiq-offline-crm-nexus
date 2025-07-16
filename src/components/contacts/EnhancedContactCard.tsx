
import React from "react";
import { Contact } from "@/services/firestoreService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Tag,
  Clock,
  Users
} from "lucide-react";

interface EnhancedContactCardProps {
  contact: Contact;
  onStatusChange: (contactId: string, newStatus: Contact['status']) => void;
}

const EnhancedContactCard: React.FC<EnhancedContactCardProps> = ({ 
  contact, 
  onStatusChange 
}) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      'Prospect': 'bg-blue-100 text-blue-800 border-blue-200',
      'Negotiation': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Won': 'bg-green-100 text-green-800 border-green-200',
      'Lost': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return variants[status as keyof typeof variants] || variants.Prospect;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    console.log('🔄 Enhanced status change event:', {
      contactId: contact.id,
      contactName: contact.name,
      oldStatus: contact.status,
      newStatus: newStatus
    });
    
    onStatusChange(contact.id!, newStatus as Contact['status']);
  };

  const getLastActivity = () => {
    if (!contact.last_activity) return 'No recent activity';
    const daysSince = Math.floor(
      (Date.now() - contact.last_activity.toDate().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince === 0 ? 'Today' : `${daysSince} days ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      {/* Header - Company Name and Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900">{contact.company_name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(contact.status)}`}>
            {contact.status}
          </Badge>
          <Select onValueChange={handleStatusChange} defaultValue={contact.status}>
            <SelectTrigger className="w-32 h-8 text-xs">
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
      
      {/* Contact Person Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-semibold text-gray-900">{contact.name}</p>
            <p className="text-sm text-gray-600">{contact.designation || 'No designation'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{contact.email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{contact.phone}</span>
          </div>
          
          {contact.industry && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{contact.industry}</span>
            </div>
          )}

          {contact.source && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Source:</span>
              <Badge variant="outline" className="text-xs">
                {contact.source}
              </Badge>
            </div>
          )}

          {contact.assigned_to && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">Assigned to: {contact.assigned_to}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Tags:</span>
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
      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
        <Clock className="w-4 h-4" />
        <span>Last activity: {getLastActivity()}</span>
      </div>

      {/* Status Timeline Preview */}
      {contact.status_timeline && contact.status_timeline.length > 1 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Status History:</div>
          <div className="flex gap-1 text-xs">
            {contact.status_timeline.slice(-3).map((timeline, index) => (
              <Badge key={index} variant="outline" className={`text-xs ${getStatusBadge(timeline.status)}`}>
                {timeline.status}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Notes */}
      {contact.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700 italic">{contact.notes}</p>
        </div>
      )}
      
      {/* Active Client Indicator */}
      {contact.status === 'Won' && (
        <div className="mt-4 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md font-medium">
          ✓ Active Client
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          View Timeline
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          Add Task
        </Button>
      </div>
    </div>
  );
};

export default EnhancedContactCard;
