import { useState, useEffect, useRef } from 'react';
import { debounce } from './utils';

export default function App() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    // 1. Input empty unte reset chesi return avvu (API call cheyoddu)
    if (!trimmedQuery) {
      setUsers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // 2. 400ms delay tarwatha fetch chese timer
    const timerId = setTimeout(async () => {
      // Previous request unte abort chey
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(
          `https://dummyjson.com/users/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users);
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    }, 400);

    // 3. Cleanup function: keystroke marithe timer & pending request rendu cancel avtayi
    return () => {
      clearTimeout(timerId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">User Search</h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {/* Empty State */}
        {!query.trim() && (
          <p className="text-gray-500 text-center py-4">Type to search</p>
        )}

        {/* Loading State */}
        {loading && query.trim() && (
          <p className="text-blue-500 text-center py-4">Loading...</p>
        )}

        {/* Error State */}
        {error && <p className="text-red-500 text-center py-4">{error}</p>}

        {/* Results List (Only show when query is NOT empty) */}
        {!loading && !error && query.trim() && users.length > 0 && (
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <li key={user.id} className="py-3">
                <p className="font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">{user.address?.city}</p>
              </li>
            ))}
          </ul>
        )}

        {/* No Results State */}
        {!loading && !error && query.trim() && users.length === 0 && (
          <p className="text-gray-500 text-center py-4">No users found.</p>
        )}
      </div>
    </div>
  );
}