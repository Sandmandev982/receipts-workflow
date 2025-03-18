
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TeamService } from '@/services/TeamService';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/services/NotificationService';

const inviteFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface TeamInviteFormProps {
  teamId: string;
  teamName: string;
  onInviteSuccess?: () => void;
}

const TeamInviteForm: React.FC<TeamInviteFormProps> = ({ teamId, teamName, onInviteSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values: InviteFormValues) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // First, check if the user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('email', values.email)
        .maybeSingle();
      
      if (userError) throw userError;
      
      if (!userData) {
        toast({
          title: 'User not found',
          description: 'No user with that email address exists in the system.',
          variant: 'destructive'
        });
        return;
      }
      
      // Get the current user's profile for the invitation notification
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      const inviterName = inviterProfile 
        ? `${inviterProfile.first_name || ''} ${inviterProfile.last_name || ''}`.trim() 
        : 'A team member';
      
      // Add the user to the team
      const success = await TeamService.addTeamMember(teamId, userData.id);
      
      if (success) {
        // Send notification to the invited user
        await NotificationService.notifyTeamInvite(
          userData.id,
          teamId,
          teamName,
          inviterName
        );
        
        toast({
          title: 'Invitation sent',
          description: `${values.email} has been invited to join ${teamName}`
        });
        
        form.reset();
        
        if (onInviteSuccess) {
          onInviteSuccess();
        }
      }
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
        <CardDescription>Send an invitation to join {teamName}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="colleague@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the email address of the person you want to invite
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending invite...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TeamInviteForm;
