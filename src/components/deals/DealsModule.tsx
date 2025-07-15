
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDeals, getContacts, Deal, Contact } from "@/utils/dataUtils";
import { Plus, DollarSign } from "lucide-react";

const DealsModule = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const stages = [
    { name: "Lead", color: "bg-gray-100" },
    { name: "Qualified", color: "bg-blue-100" },
    { name: "Proposal Sent", color: "bg-yellow-100" },
    { name: "Negotiation", color: "bg-orange-100" },
    { name: "Closed Won", color: "bg-green-100" },
    { name: "Closed Lost", color: "bg-red-100" }
  ];

  useEffect(() => {
    setDeals(getDeals());
    setContacts(getContacts());
  }, []);

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.contact_id === contactId);
    return contact ? contact.company_name : "Unknown";
  };

  const getDealsByStage = (stageName: string) => {
    return deals.filter(deal => deal.stage === stageName);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-2">Track and manage your sales opportunities</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(deals.reduce((sum, deal) => sum + (deal.value || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deals.length > 0 ? 
                    Math.round((deals.filter(d => d.stage === 'Closed Won').length / deals.length) * 100) : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.name);
          const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
          
          return (
            <div key={stage.name} className="min-h-96">
              <div className={`p-4 rounded-lg ${stage.color} mb-4`}>
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stageDeals.length} deals • {formatCurrency(stageValue)}
                </p>
              </div>

              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <Card key={deal.deal_id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{deal.deal_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{getContactName(deal.contact_id)}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(deal.value)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {deal.probability}%
                        </span>
                      </div>
                      {deal.expected_close_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Expected: {new Date(deal.expected_close_date).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealsModule;
