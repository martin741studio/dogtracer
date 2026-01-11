"use client";

import { useState, useEffect } from "react";
import ProfileQuestionnaire from "../components/ProfileQuestionnaire";
import AutoGenerateSettings from "../components/AutoGenerateSettings";
import { type DogProfile, getProfile, deleteProfile } from "../lib/profile";

export default function Profile() {
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getProfile();
    setProfile(stored);
    setLoading(false);
  }, []);

  const handleSave = (savedProfile: DogProfile) => {
    setProfile(savedProfile);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete your dog's profile?")) {
      deleteProfile();
      setProfile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-16">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!profile || isEditing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-16">
        <ProfileQuestionnaire
          existingProfile={profile}
          onSave={handleSave}
          onCancel={profile ? () => setIsEditing(false) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-20 pt-6" data-testid="profile-view">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dog Profile</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            data-testid="edit-profile-button"
          >
            Edit
          </button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mb-2 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">
              🐕
            </div>
            <h2 className="text-xl font-bold text-gray-900" data-testid="profile-dog-name">
              {profile.name}
            </h2>
            {profile.age && (
              <p className="text-gray-500" data-testid="profile-dog-age">
                {profile.age}
              </p>
            )}
          </div>

          {profile.temperament.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Temperament</h3>
              <div className="flex flex-wrap gap-2" data-testid="profile-temperament">
                {profile.temperament.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.triggers.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Known Triggers</h3>
              <div className="flex flex-wrap gap-2" data-testid="profile-triggers">
                {profile.triggers.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                  >
                    ⚠️ {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.goals.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Training Goals</h3>
              <div className="flex flex-wrap gap-2" data-testid="profile-goals">
                {profile.goals.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                  >
                    🎯 {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <AutoGenerateSettings />
        </div>

        <div className="mt-6">
          <button
            onClick={handleDelete}
            className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            data-testid="delete-profile-button"
          >
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  );
}
