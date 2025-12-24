import React, { useEffect } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { LibrarianPanel } from './views/LibrarianPanel';
import { TeacherPanel } from './views/TeacherPanel';
import { StudentPanel } from './views/StudentPanel';
import { Role } from './types';
import { Sun, Moon } from 'lucide-react';

const MainView: React.FC = () => {
  const { user, darkMode, toggleDarkMode } = useLibrary();

  if (!user) {
    return (
      <div className="min-h-screen bg-paper dark:bg-zinc-950 flex flex-col relative transition-colors duration-300">
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={toggleDarkMode}
            className="p-3 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-all text-zinc-800 dark:text-zinc-200"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <Login />
      </div>
    );
  }

  let CurrentView;
  switch (user.role) {
    case Role.LIBRARIAN:
      CurrentView = <LibrarianPanel />;
      break;
    case Role.TEACHER:
      CurrentView = <TeacherPanel />;
      break;
    case Role.STUDENT:
      CurrentView = <StudentPanel />;
      break;
    default:
      CurrentView = <div className="p-8 text-center text-red-500">Unknown Role Configuration</div>;
  }

  return (
    <Layout>
      {CurrentView}
    </Layout>
  );
};


  return (
    <LibraryProvider>
      <MainView />
    </LibraryProvider>
  );
};

export default App;