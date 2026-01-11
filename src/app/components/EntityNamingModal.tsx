'use client';

import { useState } from 'react';
import {
  type Entity,
  type DogEntity,
  type HumanEntity,
  type DogRelationship,
  type HumanRelationship,
  type DogSize,
  type DogSex,
  createDogEntity,
  createHumanEntity,
  saveEntity,
  getEntityById,
} from '../lib/entities';
import type { LabeledEntity } from '../lib/labeling';

interface EntityNamingModalProps {
  entity: LabeledEntity;
  onClose: () => void;
  onSave: (entity: Entity) => void;
}

const DOG_RELATIONSHIPS: { value: DogRelationship; label: string }[] = [
  { value: 'friend', label: '🐕 Friend' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'conflict', label: '⚠️ Conflict' },
  { value: 'unknown', label: '❓ Unknown' },
];

const HUMAN_RELATIONSHIPS: { value: HumanRelationship; label: string }[] = [
  { value: 'owner', label: '👨‍👩‍👧 Owner' },
  { value: 'friend', label: '🤝 Friend' },
  { value: 'stranger', label: '👤 Stranger' },
  { value: 'neighbor', label: '🏠 Neighbor' },
  { value: 'vet', label: '🩺 Vet' },
  { value: 'trainer', label: '🎓 Trainer' },
];

const DOG_SIZES: { value: DogSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'unknown', label: 'Unknown' },
];

const DOG_SEXES: { value: DogSex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
];

export default function EntityNamingModal({ entity, onClose, onSave }: EntityNamingModalProps) {
  const existingEntity = entity.entityId ? getEntityById(entity.entityId) : undefined;

  const [name, setName] = useState(existingEntity?.name ?? '');
  const [notes, setNotes] = useState(existingEntity?.notes ?? '');

  // Dog-specific fields
  const [breed, setBreed] = useState(
    existingEntity?.type === 'dog' ? existingEntity.metadata.breed ?? '' : ''
  );
  const [sex, setSex] = useState<DogSex>(
    existingEntity?.type === 'dog' ? existingEntity.metadata.sex : 'unknown'
  );
  const [size, setSize] = useState<DogSize>(
    existingEntity?.type === 'dog' ? existingEntity.metadata.size : 'unknown'
  );
  const [dogRelationship, setDogRelationship] = useState<DogRelationship>(
    existingEntity?.type === 'dog' ? existingEntity.metadata.relationship : 'unknown'
  );

  // Human-specific fields
  const [humanRelationship, setHumanRelationship] = useState<HumanRelationship>(
    existingEntity?.type === 'human' ? existingEntity.metadata.relationship : 'stranger'
  );

  const handleSave = () => {
    let savedEntity: Entity;

    if (entity.type === 'dog') {
      if (existingEntity && existingEntity.type === 'dog') {
        savedEntity = {
          ...existingEntity,
          name: name.trim() || null,
          notes,
          metadata: {
            ...existingEntity.metadata,
            breed: breed.trim() || null,
            sex,
            size,
            relationship: dogRelationship,
          },
        };
      } else {
        savedEntity = createDogEntity(name.trim() || null, {
          breed: breed.trim() || null,
          sex,
          size,
          relationship: dogRelationship,
        });
        savedEntity.notes = notes;
      }
    } else {
      if (existingEntity && existingEntity.type === 'human') {
        savedEntity = {
          ...existingEntity,
          name: name.trim() || null,
          notes,
          metadata: {
            relationship: humanRelationship,
          },
        };
      } else {
        savedEntity = createHumanEntity(name.trim() || null, humanRelationship);
        savedEntity.notes = notes;
      }
    }

    saveEntity(savedEntity);
    onSave(savedEntity);
  };

  const isDog = entity.type === 'dog';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      data-testid="entity-naming-modal"
    >
      <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {isDog ? '🐕 Name Dog' : '👤 Name Person'}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {entity.displayLabel}
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isDog ? "e.g., Max, Buddy" : "e.g., John, Sarah"}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              data-testid="entity-name-input"
            />
          </div>

          {isDog ? (
            <>
              {/* Breed Field (optional) */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Breed <span className="text-zinc-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g., Golden Retriever, Mixed"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                  data-testid="dog-breed-input"
                />
              </div>

              {/* Sex Field (optional) */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Sex <span className="text-zinc-400">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOG_SEXES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSex(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sex === option.value
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                      data-testid={`dog-sex-${option.value}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Field */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOG_SIZES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSize(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        size === option.value
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                      data-testid={`dog-size-${option.value}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dog Relationship */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Relationship
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOG_RELATIONSHIPS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDogRelationship(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        dogRelationship === option.value
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                      data-testid={`dog-relationship-${option.value}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Human Relationship */
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Relationship
              </label>
              <div className="flex flex-wrap gap-2">
                {HUMAN_RELATIONSHIPS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setHumanRelationship(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      humanRelationship === option.value
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                    data-testid={`human-relationship-${option.value}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Notes <span className="text-zinc-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add interaction details..."
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none"
              data-testid="entity-notes-input"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium"
            data-testid="entity-modal-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-lg bg-amber-500 text-white font-medium"
            data-testid="entity-modal-save"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
