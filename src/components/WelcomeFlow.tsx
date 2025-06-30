import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Building,
  Users,
  Shield,
  BarChart3,
  Clock,
  Wrench,
  FileText,
  Bell,
  X
} from 'lucide-react';

interface WelcomeFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userRole?: 'admin' | 'operator';
  departmentName?: string;
}

const WelcomeFlow: React.FC<WelcomeFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  userRole = 'admin',
  departmentName = 'Your Fire Department'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const totalSteps = 4;

  const steps = [
    {
      id: 1,
      title: 'Welcome to FireGauge',
      subtitle: 'Your equipment management solution',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to {departmentName}!</h3>
            <p className="text-gray-600 mb-4">
              FireGauge is now configured and ready to help you manage your equipment maintenance, 
              testing schedules, and compliance reporting with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium mb-1">Compliance Ready</h4>
              <p className="text-sm text-gray-600">
                Stay NFPA compliant with automated testing schedules and documentation.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium mb-1">Smart Reports</h4>
              <p className="text-sm text-gray-600">
                Generate detailed reports for inspections, maintenance, and compliance.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 mb-2" />
              <h4 className="font-medium mb-1">Scheduled Testing</h4>
              <p className="text-sm text-gray-600">
                Never miss a test with automated reminders and scheduling.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Users className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium mb-1">Team Collaboration</h4>
              <p className="text-sm text-gray-600">
                Multiple users can track and manage equipment together.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Your Role & Permissions',
      subtitle: `Understanding your ${userRole} access`,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="text-lg px-4 py-2 mb-4">
              {userRole === 'admin' ? '👑 Administrator' : '⚙️ Operator'}
            </Badge>
          </div>

          {userRole === 'admin' ? (
            <div className="space-y-4">
              <h4 className="font-medium text-lg">As an Administrator, you can:</h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Manage all department equipment and assets</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Create and manage user accounts</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Access billing, settings, and subscription management</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Generate and export comprehensive compliance reports</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Configure department settings and preferences</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-lg">As an Operator, you can:</h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Record equipment testing and maintenance</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Update equipment status and maintenance logs</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>View equipment status and testing schedules</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Generate basic reports and testing documentation</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 3,
      title: 'Key Features Tour',
      subtitle: 'Essential tools at your fingertips',
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Wrench className="h-8 w-8 text-red-600 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Equipment Management</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Track all your fire equipment including hoses, extinguishers, pumps, and vehicles.
                </p>
                <Badge variant="outline" className="text-xs">Navigate: Equipment → Overview</Badge>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Testing & Maintenance</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Schedule and record regular testing with automated NFPA compliance tracking.
                </p>
                <Badge variant="outline" className="text-xs">Navigate: Testing → Schedule</Badge>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Reports & Documentation</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Generate inspection reports, maintenance logs, and compliance documentation.
                </p>
                <Badge variant="outline" className="text-xs">Navigate: Reports → Generate</Badge>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Bell className="h-8 w-8 text-orange-600 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Alerts & Notifications</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Receive reminders for upcoming tests, overdue maintenance, and compliance deadlines.
                </p>
                <Badge variant="outline" className="text-xs">Navigate: Notifications → Settings</Badge>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Ready to Get Started',
      subtitle: 'Your next steps',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
            <p className="text-gray-600 mb-6">
              Your FireGauge system is configured and ready to use. Here are some recommended first steps:
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">🚀 Quick Start Checklist</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-blue-400 rounded"></div>
                  <span>Add your first piece of equipment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-blue-400 rounded"></div>
                  <span>Set up testing schedules</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-blue-400 rounded"></div>
                  <span>Configure notification preferences</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-blue-400 rounded"></div>
                  <span>Explore the reporting features</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">💡 Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our support team is here to help you get the most out of FireGauge.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Documentation</Badge>
                <Badge variant="outline" className="text-xs">Video Tutorials</Badge>
                <Badge variant="outline" className="text-xs">Live Support</Badge>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    onComplete();
  };

  const skipTour = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStepData?.title}
              </h2>
              <p className="text-gray-600">{currentStepData?.subtitle}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Content */}
          <div className="mb-8">
            {currentStepData?.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
              <Button variant="ghost" onClick={skipTour} className="text-gray-500">
                Skip Tour
              </Button>
            </div>

            <div>
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                  Start Using FireGauge
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeFlow; 