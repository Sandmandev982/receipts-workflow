
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');

  useEffect(() => {
    // Add debug logging
    console.log('Auth Component - Current session:', session, 'Loading:', loading);
    
    // Redirect to dashboard if user is already logged in
    if (session) {
      console.log('User is authenticated, redirecting to dashboard');
      toast.success('Welcome back!');
      navigate('/');
    }
  }, [session, navigate, loading]);

  const handleRegistrationSuccess = () => {
    setActiveTab('login');
    toast.success('Registration successful! Please log in.');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm onSuccess={handleRegistrationSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
