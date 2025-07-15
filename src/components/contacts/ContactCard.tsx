
import React from "react";
import { Contact } from "@/services/firestoreService";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactCardProps {
  contact: Contact;
  onStatusChange: (contactId: string, newStatus: Contact['status']) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onStatusChange }) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      'Prospect': 'bg-blue-100 text-blue-800 border-blue-200',
      'Win': 'bg-green-100 text-green-800 border-green-200',
      'Lose': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return variants[status as keyof typeof variants] || variants.Prospect;
  };

  const handleStatusChange = (newStatus: string) => {
    console.log('🔄 Status change event:', {
      contactId: contact.id,
      contactName: contact.name,
      oldStatus: contact.status,
      newStatus: newStatus
    });
    
    onStatusChange(contact.id!, newStatus as Contact['status']);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Company Name and Status */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{contact.company}</h3>
        <div className="flex flex-col items-end gap-2">
          <Badge className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(contact.status)}`}>
            {contact.status === 'Win' ? 'Active Client' : contact.status}
          </Badge>
          <Select onValueChange={handleStatusChange} defaultValue={contact.status}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Prospect">Prospect</SelectItem>
              <SelectItem value="Win">Win</SelectItem>
              <SelectItem value="Lose">Lose</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Contact Details */}
      <div className="space-y-3">
        <div>
          <p className="text-lg font-semibold text-gray-900">{contact.name}</p>
          <p className="text-sm text-gray-600">{contact.designation || 'No designation'}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <span className="ml-2 text-gray-600">{contact.email}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Phone:</span>
            <span className="ml-2 text-gray-600">{contact.phone}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Industry:</span>
            <span className="ml-2 text-gray-600">{contact.industry || 'Not specified'}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Source:</span>
            <span className="ml-2 text-gray-600">{contact.source || 'Not specified'}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Assigned to:</span>
            <span className="ml-2 text-gray-600">{contact.assignedTo || 'Unassigned'}</span>
          </div>
        </div>
        
        {/* Additional Notes */}
        {contact.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700 italic">{contact.notes}</p>
          </div>
        )}
      </div>
      
      {/* Active Client Indicator */}
      {contact.status === 'Win' && (
        <div className="mt-4 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md font-medium">
          ✓ Active Client
        </div>
      )}
    </div>
  );
};

export default ContactCard;
