import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Role, Branch, User, Book } from '../types';
import { Trash2, UserPlus, BookPlus, Pencil, Search, Lock, UserCog, Filter, MoreHorizontal } from 'lucide-react';

export const LibrarianPanel: React.FC = () => {
  const { users, books, addUser, updateUser, removeUser, bulkRemoveUsers, addBook, updateBook, removeBook, showToast } = useLibrary();
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');
  
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    role: Role.STUDENT, 
    branch: Branch.CSE, 
    semester: 1, 
    year: 1 
  });
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('PASS1234'); 

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [userBranchFilter, setUserBranchFilter] = useState<Branch | 'ALL'>('ALL');
  const [userYearFilter, setUserYearFilter] = useState<number | 'ALL'>('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  const [isEditingBook, setIsEditingBook] = useState(false);
  const [bookForm, setBookForm] = useState<Partial<Book>>({
    department: Branch.CSE,
    stock: 1
  });
  const [bookSearch, setBookSearch] = useState('');

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userName || !newUser.role) return;

    if (!isEditingUser && users.some(u => u.id === userId)) {
        alert(`Error: User ID '${userId}' already exists. Please use a unique ID.`);
        return;
    }

    if (newUser.role === Role.STUDENT && !/^[A-Z0-9]{8,10}$/.test(userId)) {
        alert("Invalid Student USN format (8-10 alphanumeric chars)");
        return;
    }

    const userData: User = {
        id: userId,
        name: userName,
        role: newUser.role,
        branch: newUser.role === Role.STUDENT || newUser.role === Role.TEACHER ? newUser.branch : undefined,
        semester: newUser.role === Role.STUDENT ? newUser.semester : undefined,
        year: newUser.role === Role.STUDENT ? newUser.year : undefined,
        email: userEmail,
        phoneNumber: userPhone,
        password: isEditingUser 
            ? (users.find(u => u.id === userId)?.password || 'PASS1234') 
            : (newUserPassword || 'PASS1234')
    };

    if (isEditingUser) {
        updateUser(userData);
        setIsEditingUser(false);
        showToast(`User details for ${userName} updated`);
    } else {
        addUser(userData);
    }
    resetUserForm();
  };

  const handleBulkDelete = () => {
      const count = selectedUserIds.size;
      if (count === 0) return;
      
      if (window.confirm(`Are you sure you want to delete ${count} users? This cannot be undone.`)) {
          bulkRemoveUsers(Array.from(selectedUserIds));
          setSelectedUserIds(new Set());
      }
  };

  const startEditUser = (user: User) => {
    setIsEditingUser(true);
    setUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email || '');
    setUserPhone(user.phoneNumber || '');
    setNewUser({
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        year: user.year
    });
    setNewUserPassword(''); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetUserForm = () => {
    setIsEditingUser(false);
    setUserId('');
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setNewUserPassword('PASS1234');
    setNewUser({ 
        role: Role.STUDENT, 
        branch: Branch.CSE, 
        semester: 1, 
        year: 1 
    });
  };

  const handleResetPassword = (user: User) => {
      if (window.confirm(`Are you sure you want to reset the password for ${user.name} to 'PASS1234'?`)) {
          updateUser({ ...user, password: 'PASS1234' });
          showToast(`Password for ${user.name} reset to PASS1234`);
      }
  };

  const toggleSelectUser = (id: string) => {
      const newSet = new Set(selectedUserIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedUserIds(newSet);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!bookForm.id || !bookForm.title || !bookForm.author || !bookForm.category) {
        alert("Please fill in required fields: Access No, Title, Author, Subject");
        return;
    }

    if (!isEditingBook && books.some(b => b.id === bookForm.id)) {
        alert(`Error: Book Access No '${bookForm.id}' already exists.`);
        return;
    }

    const payload: Book = {
        id: bookForm.id!,
        title: bookForm.title!,
        author: bookForm.author!,
        category: bookForm.category!,
        department: bookForm.department,
        stock: bookForm.stock || 0,
        isbn: bookForm.isbn,
        publisher: bookForm.publisher,
        edition: bookForm.edition,
        price: bookForm.price ? Number(bookForm.price) : undefined
    };

    if (isEditingBook) {
        updateBook(payload);
        setIsEditingBook(false);
    } else {
        addBook(payload);
    }
    
    setBookForm({ department: Branch.CSE, stock: 1 });
  };

  const startEditBook = (book: Book) => {
    setBookForm({ ...book });
    setIsEditingBook(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditBook = () => {
    setIsEditingBook(false);
    setBookForm({ department: Branch.CSE, stock: 1 });
  };

  const renderUserManagement = () => {
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                              u.id.toLowerCase().includes(userSearch.toLowerCase());
        const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
        const matchesBranch = userBranchFilter === 'ALL' || u.branch === userBranchFilter;
        const matchesYear = userYearFilter === 'ALL' || u.year === userYearFilter;
        return matchesSearch && matchesRole && matchesBranch && matchesYear;
    });

    const isAllSelected = filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length;

    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        {/* ADD/EDIT USER FORM */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 sticky top-24">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    {isEditingUser ? <UserCog size={18} /> : <UserPlus size={18} />} 
                    {isEditingUser ? 'Edit User Details' : 'Register User'}
                </h3>
                {isEditingUser && (
                    <button onClick={resetUserForm} className="text-xs text-red-500 hover:underline">Cancel</button>
                )}
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                    <label className="text-xs uppercase font-bold text-zinc-500">Role</label>
                    <select 
                        className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
                        disabled={isEditingUser} 
                    >
                        {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">ID / USN *</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 font-mono"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value.toUpperCase())}
                            placeholder={newUser.role === Role.STUDENT ? "1CR..." : "EMP..."}
                            required
                            disabled={isEditingUser} 
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Full Name *</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {!isEditingUser && (
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Password</label>
                        <input 
                            type="text"
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="Enter initial password"
                            required
                        />
                        <p className="text-[10px] text-zinc-400 mt-1">Default is PASS1234 if left blank.</p>
                    </div>
                )}
                {isEditingUser && (
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-700 italic">
                        Use 'Reset Password' in the list to restore default password.
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Email</label>
                        <input 
                            type="email"
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Phone</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                        />
                    </div>
                </div>

                {(newUser.role === Role.STUDENT || newUser.role === Role.TEACHER) && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs uppercase font-bold text-zinc-500">Department</label>
                            <select 
                                className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                                value={newUser.branch}
                                onChange={(e) => setNewUser({...newUser, branch: e.target.value as Branch})}
                            >
                                {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        
                        {newUser.role === Role.STUDENT && (
                            <>
                                <div>
                                    <label className="text-xs uppercase font-bold text-zinc-500">Semester</label>
                                    <select 
                                        className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                                        value={newUser.semester}
                                        onChange={(e) => setNewUser({...newUser, semester: parseInt(e.target.value)})}
                                    >
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-zinc-500">Year</label>
                                    <input 
                                        type="number"
                                        min="1" max="4"
                                        className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                                        value={newUser.year || ''}
                                        onChange={(e) => setNewUser({...newUser, year: parseInt(e.target.value)})}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                <button className={`w-full text-white dark:text-black py-3 font-bold hover:opacity-90 mt-4 uppercase tracking-wider text-sm ${isEditingUser ? 'bg-blue-600 dark:bg-blue-400' : 'bg-black dark:bg-white'}`}>
                    {isEditingUser ? 'Update User Details' : 'Create User'}
                </button>
            </form>
          </div>
        </div>

        {/* USER LIST */}
        <div className="lg:col-span-2 space-y-4">
            {/* Filters & Actions */}
            <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-2 flex-wrap">
                         <select 
                            className="p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-sm focus:border-black dark:focus:border-white outline-none"
                            value={userRoleFilter}
                            onChange={(e) => setUserRoleFilter(e.target.value as Role | 'ALL')}
                        >
                            <option value="ALL">All Roles</option>
                            {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                         <select 
                            className="p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-sm focus:border-black dark:focus:border-white outline-none"
                            value={userBranchFilter}
                            onChange={(e) => setUserBranchFilter(e.target.value as Branch | 'ALL')}
                        >
                            <option value="ALL">All Branches</option>
                            {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select 
                            className="p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-sm focus:border-black dark:focus:border-white outline-none"
                            value={userYearFilter}
                            onChange={(e) => setUserYearFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                        >
                            <option value="ALL">All Years</option>
                            {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input 
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            placeholder="Search Name/ID..."
                            className="pl-9 pr-4 py-2 w-full md:w-48 text-sm border bg-white dark:bg-black border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white outline-none"
                        />
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedUserIds.size > 0 && (
                    <div className="flex items-center justify-between bg-black text-white dark:bg-white dark:text-black p-3 animate-fade-in">
                        <span className="text-sm font-bold">{selectedUserIds.size} users selected</span>
                        <div className="flex gap-2">
                             <button 
                                onClick={handleBulkDelete}
                                className="flex items-center gap-1 text-xs uppercase font-bold hover:text-red-400 px-3 py-1 border border-white/20 dark:border-black/20"
                            >
                                <Trash2 size={14} /> Delete Selected
                             </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-900 text-xs uppercase text-zinc-500">
                            <th className="p-4 w-10">
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
                                        else setSelectedUserIds(new Set());
                                    }}
                                    className="accent-black dark:accent-white"
                                />
                            </th>
                            <th className="p-4">USN / ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Academic</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500">No users found matching your filters.</td>
                            </tr>
                        ) : (
                            filteredUsers.map(u => {
                            const isLibrarian = u.role === Role.LIBRARIAN;
                            return (
                                <tr key={u.id} className={`transition-colors ${isLibrarian ? 'bg-zinc-50/50 dark:bg-zinc-900/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                                    <td className="p-4">
                                        {!isLibrarian && (
                                            <input 
                                                type="checkbox"
                                                checked={selectedUserIds.has(u.id)}
                                                onChange={() => toggleSelectUser(u.id)}
                                                className="accent-black dark:accent-white"
                                            />
                                        )}
                                    </td>
                                    <td className="p-4 font-mono text-sm font-medium">
                                        {u.id}
                                        {isLibrarian && <span className="block text-[10px] text-zinc-400 font-sans uppercase">Protected</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold">{u.name}</div>
                                        <div className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 inline-block px-1 rounded mt-1">{u.role}</div>
                                    </td>
                                    <td className="p-4 text-sm text-zinc-500">
                                        {u.branch && <span>{u.branch}</span>}
                                        {u.year && <span> - Y{u.year}</span>}
                                        {u.semester && <span> (S{u.semester})</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {!isLibrarian && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleResetPassword(u)}
                                                    className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded-full transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => startEditUser(u)}
                                                    className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeUser(u.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                                                    title="Remove User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        }))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    );
  };

  const renderBookManagement = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        {/* ADD/EDIT BOOK FORM */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 sticky top-24">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    {isEditingBook ? <Pencil size={18} /> : <BookPlus size={18} />} 
                    {isEditingBook ? 'Modify Book' : 'Add New Book'}
                </h3>
                {isEditingBook && (
                    <button onClick={cancelEditBook} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
                )}
            </div>
            
            <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                    <label className="text-xs uppercase font-bold text-zinc-500">Access No (ID) *</label>
                    <input 
                        className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 font-mono"
                        value={bookForm.id || ''}
                        onChange={(e) => setBookForm({...bookForm, id: e.target.value})}
                        disabled={isEditingBook} 
                        placeholder="e.g. ACC001"
                        required
                    />
                </div>
                <div>
                    <label className="text-xs uppercase font-bold text-zinc-500">Book Title *</label>
                    <input 
                        className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                        value={bookForm.title || ''}
                        onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Author *</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={bookForm.author || ''}
                            onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Publisher</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={bookForm.publisher || ''}
                            onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">ISBN</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
                            value={bookForm.isbn || ''}
                            onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Edition</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={bookForm.edition || ''}
                            onChange={(e) => setBookForm({...bookForm, edition: e.target.value})}
                            placeholder="e.g. 3rd"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Subject *</label>
                        <input 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={bookForm.category || ''}
                            onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Department</label>
                        <select 
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={bookForm.department}
                            onChange={(e) => setBookForm({...bookForm, department: e.target.value as Branch})}
                        >
                            <option value="">General</option>
                            {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Price</label>
                        <input 
                            type="number"
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={bookForm.price || ''}
                            onChange={(e) => setBookForm({...bookForm, price: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500">Stock Qty</label>
                        <input 
                            type="number"
                            className="w-full p-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700"
                            value={bookForm.stock || 0}
                            onChange={(e) => setBookForm({...bookForm, stock: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <button className={`w-full text-white dark:text-black py-3 font-bold hover:opacity-90 mt-4 uppercase tracking-wider text-sm ${isEditingBook ? 'bg-blue-600 dark:bg-blue-400' : 'bg-black dark:bg-white'}`}>
                    {isEditingBook ? 'Update Book' : 'Add to Inventory'}
                </button>
            </form>
          </div>
        </div>

        {/* BOOK LIST */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white"
                        placeholder="Search by title, author, or access no..."
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-900 text-xs uppercase text-zinc-500">
                            <th className="p-4">Access No</th>
                            <th className="p-4">Title / Author</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {books.filter(b => 
                            b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
                            b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
                            b.id.toLowerCase().includes(bookSearch.toLowerCase())
                        ).map(b => (
                            <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                <td className="p-4 font-mono text-xs font-bold">{b.id}</td>
                                <td className="p-4">
                                    <div className="font-bold leading-tight">{b.title}</div>
                                    <div className="text-sm text-zinc-500">{b.author}</div>
                                </td>
                                <td className="p-4 text-xs text-zinc-500">
                                    <div>{b.category}</div>
                                    {b.department && <div className="text-[10px] uppercase bg-zinc-100 dark:bg-zinc-800 inline-block px-1 rounded mt-1">{b.department}</div>}
                                    {b.isbn && <div className="mt-1 font-mono">ISBN: {b.isbn}</div>}
                                </td>
                                <td className="p-4">
                                    <span className={`font-bold ${b.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {b.stock}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => startEditBook(b)}
                                        className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button 
                                        onClick={() => removeBook(b.id)}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="border-b border-black dark:border-white pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-4xl font-light tracking-tighter">Administration</h1>
            <p className="text-zinc-500 mt-2">Manage library access and comprehensive inventory.</p>
        </div>
        
        {/* TABS */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'users' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
                User Management
            </button>
            <button 
                onClick={() => setActiveTab('books')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'books' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
                Book Inventory
            </button>
        </div>
      </header>

      {activeTab === 'users' ? renderUserManagement() : renderBookManagement()}

    </div>
  );
};
