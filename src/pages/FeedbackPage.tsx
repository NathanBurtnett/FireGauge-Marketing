import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

type FeatureRequest = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  votes_count: number;
};

const MAX_VOTES_PER_EMAIL = 4;

const FeedbackPage: React.FC = () => {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'planned' | 'shipped'>('all');
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voteCountsByEmail, setVoteCountsByEmail] = useState<number>(0);

  const filtered = useMemo(() => {
    const byFilter = requests.filter(r =>
      filter === 'all' ? true : filter === 'open' ? r.status === 'open' : r.status === filter
    );
    if (!search.trim()) return byFilter;
    const q = search.toLowerCase();
    return byFilter.filter(r =>
      r.title.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
    );
  }, [requests, filter, search]);

  async function loadRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('feature_requests')
      .select('id,title,description,status,votes_count')
      .order('votes_count', { ascending: false });
    if (error) {
      toast.error('Failed to load feedback');
    } else {
      setRequests((data || []) as FeatureRequest[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function refreshVoteUsage(currentEmail: string) {
    if (!currentEmail) {
      setVoteCountsByEmail(0);
      return;
    }
    const { data, error } = await supabase
      .from('feature_votes')
      .select('id', { count: 'exact', head: true })
      .eq('voter_email', currentEmail);
    if (error) return;
    // @ts-ignore count added by supabase-js
    setVoteCountsByEmail(data?.length ?? (data as any)?.count ?? 0);
  }

  async function handleSubmitRequest() {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('feature_requests').insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      status: 'open',
      created_by_email: email || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Could not submit');
      return;
    }
    setNewTitle('');
    setNewDesc('');
    await loadRequests();
    toast.success('Thanks for the idea!');
  }

  async function handleVote(requestId: string) {
    if (!email) {
      toast.error('Enter your email to vote');
      return;
    }
    if (voteCountsByEmail >= MAX_VOTES_PER_EMAIL) {
      toast.error('You have used all 4 votes');
      return;
    }
    const { error } = await supabase.from('feature_votes').insert({
      request_id: requestId,
      voter_email: email,
    });
    if (error) {
      toast.error(error.message.includes('Vote limit') ? 'You have used all 4 votes' : 'Vote failed');
      return;
    }
    await Promise.all([loadRequests(), refreshVoteUsage(email)]);
    toast.success('Vote recorded');
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-firegauge-charcoal">Feedback & Feature Requests</h1>
          <p className="text-gray-600 mt-2">Tell us what would help your department most. You have {Math.max(0, MAX_VOTES_PER_EMAIL - voteCountsByEmail)} of {MAX_VOTES_PER_EMAIL} votes remaining.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submit a new idea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Your email (optional for ideas, required to vote)" value={email} onChange={e => { setEmail(e.target.value); refreshVoteUsage(e.target.value); }} />
            <Input placeholder="Short title (e.g., Hydrant map with due dates)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Textarea placeholder="Describe the problem or outcome you want" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={handleSubmitRequest} disabled={submitting}>Submit Idea</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex gap-2">
            {(['all','open','planned','shipped'] as const).map(k => (
              <Button key={k} variant={filter===k?'default':'outline'} size="sm" onClick={() => setFilter(k)}>{k[0].toUpperCase()+k.slice(1)}</Button>
            ))}
          </div>
          <div className="w-full md:w-80">
            <Input placeholder="Search requests" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(req => (
              <Card key={req.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{req.title}</span>
                    <span className="text-sm text-gray-500">{req.votes_count} votes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{req.description || '—'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-gray-500">Status: {req.status}</span>
                    <Button size="sm" onClick={() => handleVote(req.id)}>Vote</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-gray-500">No matching requests yet.</div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FeedbackPage;


