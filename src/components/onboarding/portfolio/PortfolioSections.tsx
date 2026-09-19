'use client';

import { useState } from 'react';
import { Plus, FolderOpen, BookOpen, Award, Link2 } from 'lucide-react';
import type { PortfolioItem, ExternalLinkEntry, PortfolioSectionEnum } from '@/lib/onboarding/types';
import { ProjectEntry } from './ProjectEntry';
import { ExternalLinkRow } from './ExternalLinkRow';
import { cn } from '@/lib/utils';
import { MAX_EXTERNAL_LINKS } from '@/lib/onboarding/constants';

interface PortfolioSectionsProps {
  items: PortfolioItem[];
  externalLinks: ExternalLinkEntry[];
  onUpdateItems: (items: PortfolioItem[]) => void;
  onUpdateLinks: (links: ExternalLinkEntry[]) => void;
}

type Tab = 'project' | 'publication' | 'achievement' | 'links';

export function PortfolioSections({ items, externalLinks, onUpdateItems, onUpdateLinks }: PortfolioSectionsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('project');

  const projects = items.filter((i) => i.section === 'project');
  const publications = items.filter((i) => i.section === 'publication');
  const achievements = items.filter((i) => i.section === 'achievement');

  const tabs = [
    { id: 'project' as Tab, label: 'Projects', icon: FolderOpen, count: projects.length },
    { id: 'publication' as Tab, label: 'Publications', icon: BookOpen, count: publications.length },
    { id: 'achievement' as Tab, label: 'Achievements', icon: Award, count: achievements.length },
    { id: 'links' as Tab, label: 'Links', icon: Link2, count: externalLinks.length },
  ];

  const addItem = (section: PortfolioSectionEnum) => {
    const newItem: PortfolioItem = {
      id: crypto.randomUUID(),
      section,
      title: '',
      description: '',
      url: '',
      doi: '',
      venue: '',
      issuer: '',
      co_authors: '',
      date_value: '',
      end_date: '',
      skills_used: [],
      credential_url: '',
      media_urls: [],
      display_order: items.length,
    };
    onUpdateItems([...items, newItem]);
  };

  const addLink = () => {
    if (externalLinks.length >= MAX_EXTERNAL_LINKS) return;
    const newLink: ExternalLinkEntry = {
      id: crypto.randomUUID(),
      label: '',
      url: '',
      display_order: externalLinks.length,
    };
    onUpdateLinks([...externalLinks, newLink]);
  };

  const updateItem = (id: string, data: Partial<PortfolioItem>) => {
    onUpdateItems(items.map((i) => (i.id === id ? { ...i, ...data } : i)));
  };

  const deleteItem = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id));
  };

  const updateLink = (id: string, data: Partial<ExternalLinkEntry>) => {
    onUpdateLinks(externalLinks.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteLink = (id: string) => {
    onUpdateLinks(externalLinks.filter((l) => l.id !== id));
  };

  const getCurrentItems = () => {
    if (activeTab === 'project') return projects;
    if (activeTab === 'publication') return publications;
    if (activeTab === 'achievement') return achievements;
    return [];
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab !== 'links' ? (
        <div className="space-y-3">
          {getCurrentItems().map((item) => (
            <ProjectEntry
              key={item.id}
              item={item}
              onUpdate={(data) => updateItem(item.id, data)}
              onDelete={() => deleteItem(item.id)}
              section={activeTab}
            />
          ))}

          {getCurrentItems().length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">No {activeTab}s added yet</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => addItem(activeTab as PortfolioSectionEnum)}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'project' ? 'Project' : activeTab === 'publication' ? 'Publication' : 'Achievement'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {externalLinks.map((link) => (
            <ExternalLinkRow
              key={link.id}
              link={link}
              onUpdate={(data) => updateLink(link.id, data)}
              onDelete={() => deleteLink(link.id)}
            />
          ))}

          {externalLinks.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Add links to your profiles and portfolios</p>
          )}

          {externalLinks.length < MAX_EXTERNAL_LINKS && (
            <button
              type="button"
              onClick={addLink}
              className="inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Link
            </button>
          )}
        </div>
      )}
    </div>
  );
}
