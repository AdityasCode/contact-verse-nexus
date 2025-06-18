
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Clock } from 'lucide-react';
import { useContactHistory } from '@/hooks/useContactHistory';

interface ContactHistoryProps {
  contactId: string;
}

export const ContactHistory = ({ contactId }: ContactHistoryProps) => {
  const { history, loading } = useContactHistory(contactId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Change History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Change History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No changes recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {formatFieldName(entry.field_name)}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(entry.changed_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">Changed from:</span>
                    <span className="font-mono bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded text-xs">
                      {entry.old_value || '(empty)'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Changed to:</span>
                    <span className="font-mono bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs">
                      {entry.new_value || '(empty)'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
