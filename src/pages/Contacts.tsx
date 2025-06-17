
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2,
  ArrowLeft,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useContacts } from "../hooks/useContacts";

const ITEMS_PER_PAGE = 25;

const Contacts = () => {
  const { theme, toggleTheme } = useTheme();
  const { contacts, loading, searchTerm, setSearchTerm, deleteContact } = useContacts();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(contacts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedContacts = contacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Contacts</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Add Button */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Link to="/contacts/new">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </Link>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedContacts.length} of {contacts.length} contacts
            {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        </div>

        {/* Contacts Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contacts found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first contact"}
            </p>
            <Link to="/contacts/new">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone || '-'}</TableCell>
                    <TableCell>{contact.company || '-'}</TableCell>
                    <TableCell>{formatDate(contact.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link to={`/contacts/${contact.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteContact(contact.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Contacts;
