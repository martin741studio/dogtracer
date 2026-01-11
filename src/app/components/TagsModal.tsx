"use client";

import { useState } from "react";
import { MOMENT_TAGS, type MomentTag } from "../lib/moments";

const TAG_ICONS: Record<MomentTag, string> = {
  walk: '🚶',
  play: '🎾',
  rest: '💤',
  training: '🧠',
  feeding: '🥣',
  vet: '🏥',
  bath: '🛁',
  social: '🐕',
  stress: '⚠️',
};

interface TagsModalProps {
  photoDataUrl: string;
  onSave: (tags: MomentTag[], notes: string) => void;
  onCancel: () => void;
}

export default function TagsModal({ photoDataUrl, onSave, onCancel }: TagsModalProps) {
  const [selectedTags, setSelectedTags] = useState<MomentTag[]>([]);
  const [notes, setNotes] = useState('');

  const toggleTag = (tag: MomentTag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave(selectedTags, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" data-testid="tags-modal">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="p-4">
          <img 
            src={photoDataUrl} 
            alt="Captured moment" 
            className="h-40 w-full rounded-lg object-cover"
          />
        </div>
        
        <div className="px-4 pb-2">
          <h3 className="mb-2 text-sm font-medium text-gray-700">Add Tags</h3>
          <div className="flex flex-wrap gap-2" data-testid="tag-buttons">
            {MOMENT_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`tag-${tag}`}
              >
                {TAG_ICONS[tag]} {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4">
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this moment..."
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            rows={2}
            data-testid="notes-input"
          />
        </div>

        <div className="flex gap-2 border-t border-gray-100 p-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            data-testid="save-button"
          >
            Save Moment
          </button>
        </div>
      </div>
    </div>
  );
}
