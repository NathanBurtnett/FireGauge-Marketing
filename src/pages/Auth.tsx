import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod Schema for Signup
const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  companyName: z.string().optional(), // Can be empty
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
  agreeToTerms: z.boolean().refine(val => val === true, { 
    message: "You must accept the Terms and Privacy Policy to continue"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});
type SignupFormValues = z.infer<typeof signupSchema>;

// Zod Schema for Login
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password cannot be empty" }), 
});
type LoginFormValues = z.infer<typeof loginSchema>;

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors, isValid: isSignupFormValid },
    reset: resetSignupForm,
    control: signupControl,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      agreeToTerms: false,
    }
  });

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isValid: isLoginFormValid },
    reset: resetLoginForm,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/dashboard');
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      if (error) throw error;
      toast.success('Logged in successfully!');
      resetLoginForm();
    } catch (error: any) {
      toast.error('Login failed', { description: error.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
          }
        }
      });
      
      if (error) throw error;
      
      if (authData.user?.identities?.length === 0) {
        toast.error('Account already exists', { 
          description: 'Please login instead'
        });
        setActiveTab('login');
      } else {
        toast.success('Signup successful!', { 
          description: 'Please check your email to confirm your account'
        });
        resetSignupForm();
      }
    } catch (error: any) {
      toast.error('Signup failed', { 
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <span className="text-firegauge-red font-poppins font-bold text-3xl">
              Fire<span className="text-firegauge-charcoal">Gauge</span>
            </span>
          </div>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">Email</label>
                  <Input id="login-email" type="email" placeholder="your@email.com" {...registerLogin("email")} />
                  {loginErrors.email && <p className="text-xs text-red-600">{loginErrors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                    <Link to="/reset-password" className="text-xs text-firegauge-red hover:underline">Forgot password?</Link>
                  </div>
                  <Input id="login-password" type="password" placeholder="Your password" {...registerLogin("password")} />
                  {loginErrors.password && <p className="text-xs text-red-600">{loginErrors.password.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-firegauge-red hover:bg-firegauge-red/90" disabled={loading || !isLoginFormValid}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="space-y-4">
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="signup-fullname" className="text-sm font-medium">Full Name</label>
                  <Input id="signup-fullname" type="text" placeholder="Your Full Name" {...registerSignup("fullName")} />
                  {signupErrors.fullName && <p className="text-xs text-red-600">{signupErrors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-companyname" className="text-sm font-medium">Company Name (Optional)</label>
                  <Input id="signup-companyname" type="text" placeholder="Your Company Name" {...registerSignup("companyName")} />
                  {signupErrors.companyName && <p className="text-xs text-red-600">{signupErrors.companyName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
                  <Input id="signup-email" type="email" placeholder="your@email.com" {...registerSignup("email")} />
                  {signupErrors.email && <p className="text-xs text-red-600">{signupErrors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
                  <Input id="signup-password" type="password" placeholder="Create a password" {...registerSignup("password")} />
                  {signupErrors.password && <p className="text-xs text-red-600">{signupErrors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</label>
                  <Input id="signup-confirm-password" type="password" placeholder="Confirm your password" {...registerSignup("confirmPassword")} />
                  {signupErrors.confirmPassword && <p className="text-xs text-red-600">{signupErrors.confirmPassword.message}</p>}
                </div>

                <div className="items-top flex space-x-2 pt-2">
                  <Checkbox id="signup-agreeToTerms" {...registerSignup("agreeToTerms")} />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="signup-agreeToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the 
                      <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-medium text-firegauge-red hover:underline ml-1">
                        Terms of Service
                      </Link>
                       {' and '}
                      <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-medium text-firegauge-red hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                    {signupErrors.agreeToTerms && (
                      <p className="text-xs text-red-600">{signupErrors.agreeToTerms.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-firegauge-red hover:bg-firegauge-red/90" disabled={loading || !isSignupFormValid}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
