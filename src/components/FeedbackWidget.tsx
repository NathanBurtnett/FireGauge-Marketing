import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FormDialog as MarketingFormDialog,
} from '@/components/ui/marketing-dialogs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

const FeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitIdea() {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('feature_requests').insert({
      title: title.trim(),
      description: desc.trim() || null,
      status: 'open',
      created_by_email: email || null,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to submit');
      return;
    }
    setTitle('');
    setDesc('');
    toast.success('Thanks! Idea submitted');
    setOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Button className="bg-firegauge-red hover:bg-firegauge-red/90" onClick={() => setOpen(true)}>Feedback</Button>
      <MarketingFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Share your idea"
        description="Tell us what would help your department most."
        submitText="Submit"
        onSubmit={async (e) => { e.preventDefault(); await submitIdea(); }}
      >
        <div className="space-y-3">
          <Input placeholder="Your email (optional)" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Short title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Describe the outcome you want" value={desc} onChange={e => setDesc(e.target.value)} />
          <div className="text-xs text-gray-500">Votes are limited to 4 per email across all ideas. Add your email when voting on the Feedback page.</div>
        </div>
      </MarketingFormDialog>
    </div>
  );
};

export default FeedbackWidget;


