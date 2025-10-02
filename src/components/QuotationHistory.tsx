import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  Package, 
  BookOpen, 
  Printer, 
  ShoppingBag,
  Trash2,
  Eye
} from "lucide-react";
import { QuotationLogger, QuotationLog } from "@/lib/quotationLogger";
import { toast } from "sonner";

export const QuotationHistory = () => {
  const [quotations, setQuotations] = useState<QuotationLog[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<QuotationLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Load quotations on component mount
  useEffect(() => {
    loadQuotations();
  }, []);

  // Filter and search quotations
  useEffect(() => {
    let filtered = quotations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.quoteReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.calculatorType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(q => q.calculatorType === filterType);
    }

    // User filter
    if (filterUser !== "all") {
      filtered = filtered.filter(q => q.userName === filterUser);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case "amount-high":
          return b.pricing.totalAmount - a.pricing.totalAmount;
        case "amount-low":
          return a.pricing.totalAmount - b.pricing.totalAmount;
        default:
          return 0;
      }
    });

    setFilteredQuotations(filtered);
  }, [quotations, searchTerm, filterType, filterUser, sortBy]);

  const loadQuotations = () => {
    const logs = QuotationLogger.getAllQuotations();
    setQuotations(logs);
  };

  const clearAllQuotations = () => {
    if (confirm("Are you sure you want to clear all quotation history? This action cannot be undone.")) {
      QuotationLogger.clearAllQuotations();
      loadQuotations();
      toast.success("All quotation history cleared");
    }
  };

  const exportQuotations = () => {
    const data = QuotationLogger.exportQuotations();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotation-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Quotation history exported");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'box': return <Package className="h-4 w-4" />;
      case 'brochure': return <BookOpen className="h-4 w-4" />;
      case 'digital-print': return <Printer className="h-4 w-4" />;
      case 'paper-bag': return <ShoppingBag className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'box': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'brochure': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'digital-print': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'paper-bag': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const uniqueUsers = [...new Set(quotations.map(q => q.userName))];
  const statistics = QuotationLogger.getStatistics();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{statistics.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{statistics.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">₹</span>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{statistics.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Quotation History
          </CardTitle>
          <CardDescription>View and manage all generated quotations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="brochure">Brochure</SelectItem>
                  <SelectItem value="digital-print">Digital Print</SelectItem>
                  <SelectItem value="paper-bag">Paper Bag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-filter">User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                  <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportQuotations}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllQuotations} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations ({filteredQuotations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quotations found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotations.map((quotation) => (
                <Card key={quotation.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(quotation.calculatorType)}
                          <Badge className={getTypeBadgeColor(quotation.calculatorType)}>
                            {quotation.calculatorType.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <span className="font-mono text-sm font-medium">{quotation.quoteReference}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {quotation.userName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(quotation.timestamp).toLocaleDateString('en-IN')}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">⏰</span>
                            {new Date(quotation.timestamp).toLocaleTimeString('en-IN')}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Base: ₹{quotation.pricing.baseAmount.toLocaleString('en-IN')} | 
                          GST: ₹{quotation.pricing.gstAmount.toLocaleString('en-IN')} | 
                          Shipping: ₹{quotation.pricing.shippingCharges.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ₹{quotation.pricing.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Final Amount
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
