import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Eye, Edit, Clock, Users, Send } from "lucide-react";
import { emailService, EmailTemplate, EmailSequence } from '../lib/emailService';

const EmailTemplateManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');

  const templates = emailService.getTemplates();
  const sequences = emailService.getSequences();

  const renderEmailPreview = (template: EmailTemplate) => {
    const sampleData = {
      firstName: 'John',
      lastName: 'Smith',
      departmentName: 'Metro Fire Department',
      planType: 'Professional',
      email: 'john.smith@example.com'
    };

    // Simple personalization for preview
    const personalizePreview = (content: string) => {
      let personalized = content;
      Object.keys(sampleData).forEach(key => {
        personalized = personalized.replace(
          new RegExp(`{{${key}}}`, 'g'),
          sampleData[key as keyof typeof sampleData]
        );
      });
      return personalized;
    };

    return previewMode === 'html' 
      ? personalizePreview(template.htmlContent)
      : personalizePreview(template.textContent);
  };

  const getSequenceForTemplate = (templateId: string) => {
    return sequences.find(seq => seq.templateId === templateId);
  };

  const formatDelay = (hours: number) => {
    if (hours === 0) return 'Immediately';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Template Manager</h1>
        <p className="text-gray-600">Manage automated email sequences and templates for customer onboarding and engagement.</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="sequences" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Email Sequences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(templates).map((template) => {
              const sequence = getSequenceForTemplate(template.id);
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Mail className="h-8 w-8 text-red-600 mb-2" />
                      {sequence && (
                        <Badge variant="secondary" className="text-xs">
                          {formatDelay(sequence.delay)}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sequence && (
                        <div className="text-sm text-gray-600">
                          <strong>Trigger:</strong> {sequence.trigger.replace('_', ' ')}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Preview: {template.name}</DialogTitle>
                              <DialogDescription>
                                Preview how this email will look with sample data
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Button 
                                  variant={previewMode === 'html' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setPreviewMode('html')}
                                >
                                  HTML View
                                </Button>
                                <Button 
                                  variant={previewMode === 'text' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setPreviewMode('text')}
                                >
                                  Text View
                                </Button>
                              </div>
                              
                              <ScrollArea className="h-[500px] border rounded-md">
                                {previewMode === 'html' ? (
                                  <div 
                                    className="p-4"
                                    dangerouslySetInnerHTML={{ 
                                      __html: selectedTemplate ? renderEmailPreview(selectedTemplate) : '' 
                                    }}
                                  />
                                ) : (
                                  <pre className="p-4 text-sm whitespace-pre-wrap">
                                    {selectedTemplate ? renderEmailPreview(selectedTemplate) : ''}
                                  </pre>
                                )}
                              </ScrollArea>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="ghost" size="sm" disabled>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <div className="grid gap-6">
            {Object.values(
              sequences.reduce((acc, sequence) => {
                if (!acc[sequence.trigger]) {
                  acc[sequence.trigger] = [];
                }
                acc[sequence.trigger].push(sequence);
                return acc;
              }, {} as Record<string, EmailSequence[]>)
            ).map((sequenceGroup, groupIndex) => (
              <Card key={groupIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Clock className="h-5 w-5 text-red-600" />
                    {sequenceGroup[0].trigger.replace('_', ' ')} Sequence
                  </CardTitle>
                  <CardDescription>
                    Automated emails triggered by {sequenceGroup[0].trigger.replace('_', ' ')} events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sequenceGroup
                      .sort((a, b) => a.delay - b.delay)
                      .map((sequence, index) => {
                        const template = templates[sequence.templateId];
                        return (
                          <div key={sequence.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-red-600">{index + 1}</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{template?.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {formatDelay(sequence.delay)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{template?.subject}</p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" disabled>
                                <Send className="h-4 w-4 mr-1" />
                                Test Send
                              </Button>
                              <Button variant="ghost" size="sm" disabled>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📧 SendGrid Configuration Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-800">
            <p>To enable email automation, please configure the following environment variables:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><code>VITE_SENDGRID_API_KEY</code> - Your SendGrid API key</li>
              <li><code>VITE_SENDGRID_FROM_EMAIL</code> - Verified sender email (e.g., noreply@firegauge.com)</li>
              <li><code>VITE_SENDGRID_FROM_NAME</code> - Sender name (e.g., FireGauge Team)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateManager;