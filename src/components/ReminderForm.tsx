
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Save, X } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { useContacts } from '@/hooks/useContacts';
import { toast } from '@/hooks/use-toast';

interface ReminderFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ReminderForm = ({ onClose, onSuccess }: ReminderFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    remind_at: '',
    contact_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { createReminder } = useReminders();
  const { contacts } = useContacts();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.remind_at) {
      errors.remind_at = "Reminder time is required";
    } else {
      const reminderTime = new Date(formData.remind_at);
      const now = new Date();
      if (reminderTime <= now) {
        errors.remind_at = "Reminder time cannot be in the past";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const reminderData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        remind_at: formData.remind_at,
        contact_id: formData.contact_id || undefined
      };

      const result = await createReminder(reminderData);
      
      if (result.success) {
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create reminder",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set default datetime to current time + 1 hour
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const defaultDateTime = now.toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      remind_at: defaultDateTime
    }));
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Create New Reminder</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="What do you need to be reminded about?"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={validationErrors.title ? "border-red-500" : ""}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500">{validationErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details (optional)"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remind_at">Reminder Time *</Label>
            <Input
              id="remind_at"
              type="datetime-local"
              value={formData.remind_at}
              onChange={(e) => handleChange('remind_at', e.target.value)}
              className={validationErrors.remind_at ? "border-red-500" : ""}
            />
            {validationErrors.remind_at && (
              <p className="text-sm text-red-500">{validationErrors.remind_at}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_id">Related Contact (Optional)</Label>
            <Select value={formData.contact_id} onValueChange={(value) => handleChange('contact_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No contact</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Creating..." : "Create Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
