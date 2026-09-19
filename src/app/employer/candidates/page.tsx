'use client';
import { useState } from 'react';
import { Search, User, Star, Award, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Candidate {
  id: string;
  name?: string;
  gx_score: number;
  skills: string[];
  match_percentage?: number;
}

function getGxScoreStyle(score: number) {
  if (score >= 85) return { text: 'text-emerald-400', badge: 'bg-emerald-500/20' };
  if (score >= 70) return { text: 'text-cyan-400', badge: 'bg-cyan-500/20' };
  if (score >= 50) return { text: 'text-amber-400', badge: 'bg-amber-500/20' };
  return { text: 'text-gray-400', badge: 'bg-gray-500/20' };
}

export default function CandidatesPage() {
  const [skills, setSkills] = useState('');
  const [minGxScore, setMinGxScore] = useState('');
  const [maxGxScore, setMaxGxScore] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setHasSearched(true);

    const params = new URLSearchParams();
    if (skills.trim()) {
      params.set('skills', skills.trim());
    }
    if (minGxScore) {
      params.set('min_gx_score', minGxScore);
    }
    if (maxGxScore) {
      params.set('max_gx_score', maxGxScore);
    }

    try {
      const response = await fetch(`/api/v1/employer/candidates?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates ?? data ?? []);
      } else {
        setCandidates([]);
      }
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050607]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Candidate Search</h1>
          <p className="text-gray-400 mt-1">
            Find top talent that matches your requirements
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Skills
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="e.g. react, typescript, python"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Min GX Score
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={minGxScore}
                onChange={(e) => setMinGxScore(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Max GX Score
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="100"
                value={maxGxScore}
                onChange={(e) => setMaxGxScore(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search Candidates
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-700 rounded w-16" />
                  <div className="h-6 bg-gray-700 rounded w-20" />
                  <div className="h-6 bg-gray-700 rounded w-14" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-700 rounded flex-1" />
                  <div className="h-9 bg-gray-700 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && candidates.length === 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {hasSearched ? 'No candidates found' : 'Find your ideal candidates'}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Search for candidates by skills or GX score to find the best matches
              for your opportunities
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => {
              const scoreStyle = getGxScoreStyle(candidate.gx_score);
              return (
                <div
                  key={candidate.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {candidate.name || 'Anonymous Student'}
                      </h3>
                      {candidate.match_percentage !== undefined && (
                        <p className="text-sm text-gray-400">
                          {candidate.match_percentage}% match
                        </p>
                      )}
                    </div>
                  </div>

                  {/* GX Score */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">GX Score</span>
                      <span
                        className={`ml-auto text-lg font-bold ${scoreStyle.text}`}
                      >
                        {candidate.gx_score}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${scoreStyle.badge} ${scoreStyle.text}`}
                      >
                        {candidate.gx_score >= 85
                          ? 'Excellent'
                          : candidate.gx_score >= 70
                            ? 'Good'
                            : candidate.gx_score >= 50
                              ? 'Average'
                              : 'Below Avg'}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {candidate.skills.slice(0, 5).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-gray-800 text-gray-300 border-gray-700 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-800 text-gray-500 border-gray-700 text-xs"
                        >
                          +{candidate.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <Star className="h-3.5 w-3.5 mr-1.5" />
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Invite to Apply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
