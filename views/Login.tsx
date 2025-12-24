import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Role } from '../types';

export const Login: React.FC = () => {
  const { login } = useLibrary();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    const sanitizedId = id.toUpperCase().trim();


    if (sanitizedId.length > 6) {
        const studentRegex = /^[A-Z0-9]{8,10}$/;
        if (!studentRegex.test(sanitizedId)) {
            setError('Invalid format. Student IDs must be 8-10 uppercase alphanumeric characters.');
            return;
        }
    }

    if (!password) {
        setError('Please enter your password.');
        return;
    }

    const success = login(sanitizedId, password);
    if (!success) {
       setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Library Network</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 transition-colors">Enter your credentials to continue.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 uppercase tracking-wide">USN</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value.toUpperCase().trim())}
              className="w-full bg-transparent border-b-2 border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white outline-none py-2 transition-colors text-lg"
              placeholder="e.g. 1CR19CS001 or LIB001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white outline-none py-2 transition-colors text-lg"
              placeholder="e.g. PASS1234"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black py-3 font-bold uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4 transition-colors">
          <p>Demo Credentials (Password: PASS1234):</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <span>Admin: LIB001</span>
            <span>Teacher: TEA001</span>
            <span>Student: 1CR19CS001</span>
            <span>Student: 1CR19ME002</span>
          </div>
        </div>
      </div>
    </div>
  );
};