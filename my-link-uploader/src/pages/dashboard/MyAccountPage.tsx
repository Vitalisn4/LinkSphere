"use client";

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { User } from "lucide-react";
import ApiService from "../../services/api";

export default function MyAccountPage() {
  const { user, setUser } = useAuth();
  const { isDark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedUser = await ApiService.updateUsername(newUsername);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("Username updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        className={`rounded-lg p-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="flex items-center space-x-4 mb-6">
          <User
            size={48}
            className={isDark ? "text-gray-300" : "text-gray-700"}
          />
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              My Account
            </h1>
            <p
              className={`text-lg font-bold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage your account settings
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Username
            </label>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.username}
            </p>
            <button
              className="mt-2 px-3 py-1 text-sm rounded font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow hover:from-pink-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
              onClick={() => {
                setEditing((v) => !v);
                setNewUsername(user?.username || "");
                setError(null);
                setSuccess(null);
              }}
            >
              {editing ? "Cancel" : "Edit Username"}
            </button>
            {editing && (
              <form
                onSubmit={handleUsernameUpdate}
                className="mt-4 flex flex-col gap-2"
              >
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="px-3 py-2 border rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                  disabled={loading}
                  required
                  minLength={3}
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow hover:from-pink-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50"
                  disabled={loading || newUsername === user?.username}
                >
                  {loading ? "Updating..." : "Save"}
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}
              </form>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Email
            </label>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
