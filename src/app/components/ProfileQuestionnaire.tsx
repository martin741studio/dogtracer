"use client";

import { useState } from "react";
import {
  type DogProfile,
  type Temperament,
  TEMPERAMENTS,
  createProfile,
  saveProfile,
} from "../lib/profile";

const TEMPERAMENT_ICONS: Record<Temperament, string> = {
  confident: "💪",
  shy: "🙈",
  curious: "🔍",
  protective: "🛡️",
  social: "🤝",
  independent: "🚶",
  "high-energy": "⚡",
  calm: "😌",
  anxious: "😰",
  reactive: "⚡",
};

interface ProfileQuestionnaireProps {
  existingProfile?: DogProfile | null;
  onSave: (profile: DogProfile) => void;
  onCancel?: () => void;
}

export default function ProfileQuestionnaire({
  existingProfile,
  onSave,
  onCancel,
}: ProfileQuestionnaireProps) {
  const [name, setName] = useState(existingProfile?.name || "");
  const [age, setAge] = useState(existingProfile?.age || "");
  const [temperament, setTemperament] = useState<Temperament[]>(
    existingProfile?.temperament || []
  );
  const [triggers, setTriggers] = useState<string[]>(
    existingProfile?.triggers || []
  );
  const [goals, setGoals] = useState<string[]>(existingProfile?.goals || []);
  const [newTrigger, setNewTrigger] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const toggleTemperament = (t: Temperament) => {
    setTemperament((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const addTrigger = () => {
    const trimmed = newTrigger.trim();
    if (trimmed && !triggers.includes(trimmed)) {
      setTriggers([...triggers, trimmed]);
      setNewTrigger("");
    }
  };

  const removeTrigger = (t: string) => {
    setTriggers(triggers.filter((x) => x !== t));
  };

  const addGoal = () => {
    const trimmed = newGoal.trim();
    if (trimmed && !goals.includes(trimmed)) {
      setGoals([...goals, trimmed]);
      setNewGoal("");
    }
  };

  const removeGoal = (g: string) => {
    setGoals(goals.filter((x) => x !== g));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const profile: DogProfile = existingProfile
      ? {
          ...existingProfile,
          name: name.trim(),
          age: age.trim() || null,
          temperament,
          triggers,
          goals,
          updatedAt: Date.now(),
        }
      : {
          ...createProfile(name.trim()),
          age: age.trim() || null,
          temperament,
          triggers,
          goals,
        };

    saveProfile(profile);
    onSave(profile);
  };

  const isEditing = !!existingProfile;

  return (
    <div
      className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
      data-testid="profile-questionnaire"
    >
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        {isEditing ? "Edit Dog Profile" : "Set Up Your Dog's Profile"}
      </h2>

      <div className="mb-4">
        <label
          htmlFor="dog-name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Dog Name *
        </label>
        <input
          id="dog-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your dog's name"
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          data-testid="dog-name-input"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="dog-age"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Age (optional)
        </label>
        <input
          id="dog-age"
          type="text"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g., 2 years, 6 months"
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          data-testid="dog-age-input"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Temperament (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2" data-testid="temperament-buttons">
          {TEMPERAMENTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTemperament(t)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                temperament.includes(t)
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-testid={`temperament-${t}`}
            >
              {TEMPERAMENT_ICONS[t]} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Known Triggers
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTrigger()}
            placeholder="e.g., scooters, loud noises"
            className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            data-testid="trigger-input"
          />
          <button
            type="button"
            onClick={addTrigger}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            data-testid="add-trigger-button"
          >
            Add
          </button>
        </div>
        {triggers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2" data-testid="triggers-list">
            {triggers.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
              >
                ⚠️ {t}
                <button
                  type="button"
                  onClick={() => removeTrigger(t)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Training Goals
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="e.g., better recall, less leash reactivity"
            className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            data-testid="goal-input"
          />
          <button
            type="button"
            onClick={addGoal}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            data-testid="add-goal-button"
          >
            Add
          </button>
        </div>
        {goals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2" data-testid="goals-list">
            {goals.map((g) => (
              <span
                key={g}
                className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
              >
                🎯 {g}
                <button
                  type="button"
                  onClick={() => removeGoal(g)}
                  className="ml-1 text-green-500 hover:text-green-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            data-testid="profile-cancel-button"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          data-testid="profile-save-button"
        >
          {isEditing ? "Save Changes" : "Create Profile"}
        </button>
      </div>
    </div>
  );
}
