
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContacts, Contact } from "@/utils/dataUtils";
import { Plus, Search, Filter } from "lucide-react";

const ContactsModule = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const loadedContacts = getContacts();
    setContacts(loadedContacts);
    setFilteredContacts(loadedContacts);
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your business contacts and leads</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.contact_id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{contact.company_name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{contact.contact_person}</p>
                  {contact.title && (
                    <p className="text-xs text-gray-500">{contact.title}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contact.category === 'Active Client' ? 'bg-green-100 text-green-800' :
                  contact.category === 'Prospect' ? 'bg-blue-100 text-blue-800' :
                  contact.category === 'Partner' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {contact.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Industry:</span>
                  <span className="ml-2">{contact.industry}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Source:</span>
                  <span className="ml-2">{contact.source}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Assigned to:</span>
                  <span className="ml-2">{contact.assigned_to}</span>
                </div>
                {contact.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <p className="text-gray-700">{contact.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No contacts found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default ContactsModule;
