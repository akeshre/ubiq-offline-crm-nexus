
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{contact.name}</h3>
        <div className="flex flex-col items-end gap-2">
          <Badge 
            className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(contact.status)}`}
          >
            {contact.status}
          </Badge>
          <Select onValueChange={handleStatusChange} defaultValue={contact.status}>
            <SelectTrigger className="w-24 h-6 text-xs">
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
      
      <div className="space-y-2 text-sm text-gray-600">
        <p className="truncate">
          <span className="font-medium">Email:</span> {contact.email}
        </p>
        <p className="truncate">
          <span className="font-medium">Phone:</span> {contact.phone}
        </p>
        <p className="truncate">
          <span className="font-medium">Company:</span> {contact.company}
        </p>
      </div>
      
      {contact.status === 'Win' && (
        <div className="mt-3 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
          ✓ Active Client
        </div>
      )}
    </div>
  );
};

export default ContactCard;
