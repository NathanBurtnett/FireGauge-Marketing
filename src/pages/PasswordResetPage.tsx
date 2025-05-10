import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Assuming supabase client is correctly set up
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// This page will handle multiple states: initial, email_sent, token_received (for setting new password)
// For now, focusing on the initial state: requesting the password reset email.

// Schema for Request Reset Form
const requestResetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});
type RequestResetFormValues = z.infer<typeof requestResetSchema>;

// Schema for Update Password Form
const updatePasswordSchema = z.object({
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"], 
});
type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

const PasswordResetPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('request_reset');
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    register: registerRequestReset,
    handleSubmit: handleSubmitRequestReset,
    formState: { errors: requestResetErrors, isValid: isRequestResetFormValid },
    reset: resetRequestResetForm,
  } = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    mode: 'onChange',
  });

  const {
    register: registerUpdatePassword,
    handleSubmit: handleSubmitUpdatePassword,
    formState: { errors: updatePasswordErrors, isValid: isUpdatePasswordFormValid },
    reset: resetUpdatePasswordForm,
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove #
      const token = params.get('access_token');
      const type = params.get('type');

      if (token && type === 'recovery') {
        setRecoveryToken(token);
        setView('update_password');
        // Clear the hash from the URL for cleanliness and security
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } else if (token && type !== 'recovery') {
        setError('Invalid or expired token type provided.');
        toast.error('Invalid Link', { description: 'This link is not for password recovery or may have expired.' });
        setView('request_reset'); // Fallback to request form
      }
    }
  }, []);

  const onRequestResetSubmit: SubmitHandler<RequestResetFormValues> = async (data) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (requestError) throw requestError;
      toast.success('Password reset email sent', {
        description: 'If an account exists for this email, you will receive instructions to reset your password shortly.'
      });
      setMessage('If an account exists for this email, please check your inbox (and spam folder). You can close this page.');
      resetRequestResetForm();
    } catch (catchedError: any) {
      console.error("Error requesting password reset:", catchedError);
      toast.error('Error sending reset email', {
        description: catchedError.message || 'Please try again. Make sure your email is correct.'
      });
      setError('Failed to send password reset email. Please check the email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePasswordSubmit: SubmitHandler<UpdatePasswordFormValues> = async (data) => {
    if (!recoveryToken) { // Should be caught by view logic, but defensive check
        setError('Invalid session for password update. Please request a new reset link.');
        toast.error('Update Failed', {description: 'Missing recovery token.'});
        setView('request_reset');
        return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword });
      if (updateError) throw updateError;
      toast.success('Password updated successfully!', { description: 'You can now log in with your new password.' });
      setMessage('Password updated successfully! You will be redirected to login shortly.');
      resetUpdatePasswordForm();
      setTimeout(() => navigate('/auth'), 3000);
    } catch (catchedError: any) {
      console.error("Error updating password:", catchedError);
      toast.error('Password update failed', { description: catchedError.message || 'Please try again.' });
      setError(catchedError.message || 'An unexpected error occurred. If the problem persists, please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'update_password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <Link to="/" className="flex justify-center mb-4">
              <span className="text-firegauge-red font-poppins font-bold text-3xl">
                Fire<span className="text-firegauge-charcoal">Gauge</span>
              </span>
            </Link>
            <CardTitle className="text-2xl">Set New Password</CardTitle>
            <CardDescription>Enter and confirm your new password.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitUpdatePassword(onUpdatePasswordSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                <Input id="new-password" type="password" placeholder="Enter new password" {...registerUpdatePassword("newPassword")} />
                {updatePasswordErrors.newPassword && <p className="text-xs text-red-600">{updatePasswordErrors.newPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-new-password" className="text-sm font-medium">Confirm New Password</label>
                <Input id="confirm-new-password" type="password" placeholder="Confirm new password" {...registerUpdatePassword("confirmNewPassword")} />
                {updatePasswordErrors.confirmNewPassword && <p className="text-xs text-red-600">{updatePasswordErrors.confirmNewPassword.message}</p>}
              </div>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-4">
              <Button type="submit" className="w-full bg-firegauge-red hover:bg-firegauge-red/90" disabled={loading || !isUpdatePasswordFormValid || !!message.includes('successfully')}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
              <Button variant="link" className="text-sm text-firegauge-charcoal hover:text-firegauge-red" onClick={() => { setView('request_reset'); setError(''); setMessage(''); navigate('/reset-password', {replace: true}); }} type="button" disabled={loading}>
                Request new link
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Default view: request_reset
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link to="/" className="flex justify-center mb-4">
            <span className="text-firegauge-red font-poppins font-bold text-3xl">
              Fire<span className="text-firegauge-charcoal">Gauge</span>
            </span>
          </Link>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmitRequestReset(onRequestResetSubmit)}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-medium">Email</label>
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="your@email.com" 
                {...registerRequestReset("email")} 
                disabled={loading || !!message} // Disable if loading or success message shown and no error
              />
              {requestResetErrors.email && <p className="text-xs text-red-600">{requestResetErrors.email.message}</p>}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
          </CardContent>
          
          <CardFooter className="flex flex-col items-center space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-firegauge-red hover:bg-firegauge-red/90"
              disabled={loading || !isRequestResetFormValid || (!!message && !error)}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button variant="link" className="text-sm text-firegauge-charcoal hover:text-firegauge-red" onClick={() => navigate('/auth')} type="button" disabled={loading}>
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PasswordResetPage; 