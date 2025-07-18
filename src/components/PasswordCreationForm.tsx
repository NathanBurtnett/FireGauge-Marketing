import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, EyeOff, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { validatePasswordComplexity, validatePasswordMatch, getPasswordRequirements } from '@/utils/passwordValidation';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

interface PasswordCreationFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const PasswordCreationForm: React.FC<PasswordCreationFormProps> = ({ 
  email, 
  onSuccess, 
  onBack 
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get real-time password validation
  const passwordValidation = password ? validatePasswordComplexity(password, email.split('@')[0]) : null;
  const matchValidation = password && confirmPassword ? validatePasswordMatch(password, confirmPassword) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation?.isValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    if (!matchValidation?.isMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
      });

      onSuccess();
    } catch (err) {
      console.error('Password signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRequirementStatus = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStrengthColor = (score: number) => {
    if (score < 30) return 'bg-red-500';
    if (score < 50) return 'bg-orange-500';
    if (score < 70) return 'bg-yellow-500';
    if (score < 85) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const requirements = getPasswordRequirements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-firegauge-charcoal flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-firegauge-red" />
            Create Your Password
          </CardTitle>
          <CardDescription>
            Create a secure password for {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && passwordValidation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Password Strength</span>
                  <Badge variant="outline" className={`text-xs ${
                    passwordValidation.strength.color === 'destructive' ? 'border-red-500 text-red-500' :
                    passwordValidation.strength.color === 'default' ? 'border-yellow-500 text-yellow-500' :
                    passwordValidation.strength.color === 'secondary' ? 'border-blue-500 text-blue-500' :
                    'border-green-500 text-green-500'
                  }`}>
                    {passwordValidation.strength.label}
                  </Badge>
                </div>
                <Progress 
                  value={passwordValidation.strength.progress} 
                  className="h-2"
                />
                <p className="text-xs text-gray-600">{passwordValidation.strength.description}</p>
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && matchValidation && !matchValidation.isMatch && (
                <p className="text-xs text-red-500">{matchValidation.error}</p>
              )}
            </div>

            {/* Password Requirements */}
            {password && passwordValidation && (
              <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Password Requirements:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {getRequirementStatus(passwordValidation.details.length >= 12)}
                    <span className={passwordValidation.details.length >= 12 ? 'text-green-600' : 'text-red-600'}>
                      At least 12 characters ({passwordValidation.details.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {getRequirementStatus(passwordValidation.details.hasUppercase)}
                    <span className={passwordValidation.details.hasUppercase ? 'text-green-600' : 'text-red-600'}>
                      Uppercase letters (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {getRequirementStatus(passwordValidation.details.hasLowercase)}
                    <span className={passwordValidation.details.hasLowercase ? 'text-green-600' : 'text-red-600'}>
                      Lowercase letters (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {getRequirementStatus(passwordValidation.details.hasNumbers)}
                    <span className={passwordValidation.details.hasNumbers ? 'text-green-600' : 'text-red-600'}>
                      Numbers (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {getRequirementStatus(passwordValidation.details.hasSpecialChars)}
                    <span className={passwordValidation.details.hasSpecialChars ? 'text-green-600' : 'text-red-600'}>
                      Special characters (!@#$%^&*...)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {getRequirementStatus(!passwordValidation.details.isCommonPassword)}
                    <span className={!passwordValidation.details.isCommonPassword ? 'text-green-600' : 'text-red-600'}>
                      Not a common password
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {password && passwordValidation && passwordValidation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {passwordValidation.errors.map((error, index) => (
                      <li key={index} className="text-xs">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {password && passwordValidation && passwordValidation.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {passwordValidation.warnings.map((warning, index) => (
                      <li key={index} className="text-xs">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-firegauge-red hover:bg-firegauge-red/90"
              disabled={isLoading || !passwordValidation?.isValid || !matchValidation?.isMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBack}
              disabled={isLoading}
            >
              Back to Magic Link
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordCreationForm; 