import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { Search, Plus, Phone, Mail, Star, Trash2, X, User, Edit2 } from 'lucide-react';

interface ContactsListProps {
  contacts: Contact[];
  onCallContact: (number: string, name: string) => void;
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onEditContact: (id: string, updatedFields: Partial<Contact>) => void;
  onDeleteContact: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  prefilledContact?: { name: string; phone: string } | null;
  clearPrefilledContact?: () => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  onCallContact,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onToggleFavorite,
  prefilledContact,
  clearPrefilledContact,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFavorite, setNewFavorite] = useState(false);

  // Edit Contact Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFavorite, setEditFavorite] = useState(false);

  useEffect(() => {
    if (prefilledContact) {
      setNewName(prefilledContact.name || '');
      setNewPhone(prefilledContact.phone || '');
      setNewEmail('');
      setNewFavorite(false);
      setShowAddModal(true);
      if (clearPrefilledContact) {
        clearPrefilledContact();
      }
    }
  }, [prefilledContact, clearPrefilledContact]);

  const gradients = [
    'from-red-400 to-pink-500',
    'from-orange-400 to-amber-500',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-fuchsia-500',
    'from-cyan-400 to-blue-500',
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    onAddContact({
      name: newName,
      phone: newPhone,
      email: newEmail || 'no-email@phone.app',
      avatarColor: randomGradient,
      isFavorite: newFavorite,
    });

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewFavorite(false);
    setShowAddModal(false);
  };

  const handleEditClick = (contact: Contact) => {
    setEditName(contact.name);
    setEditPhone(contact.phone);
    setEditEmail(contact.email === 'no-email@phone.app' ? '' : contact.email);
    setEditFavorite(contact.isFavorite);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !editName.trim() || !editPhone.trim()) return;

    onEditContact(selectedContact.id, {
      name: editName,
      phone: editPhone,
      email: editEmail || 'no-email@phone.app',
      isFavorite: editFavorite,
    });

    // Update locally to reflect changes in current details view
    setSelectedContact({
      ...selectedContact,
      name: editName,
      phone: editPhone,
      email: editEmail || 'no-email@phone.app',
      isFavorite: editFavorite,
    });

    setShowEditModal(false);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  // Group by first letter
  const groupedContacts: Record<string, Contact[]> = {};
  filteredContacts
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((contact) => {
      const firstLetter = contact.name.trim()[0].toUpperCase() || '#';
      const key = /^[A-Z]$/.test(firstLetter) ? firstLetter : '#';
      if (!groupedContacts[key]) {
        groupedContacts[key] = [];
      }
      groupedContacts[key].push(contact);
    });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div id="contacts_tab" className="flex flex-col h-full bg-transparent text-white select-none">
      {/* Header */}
      <div className="p-4 pb-2 flex justify-between items-center border-b border-white/10">
        <h1 className="text-2xl font-bold font-sans">Contacts</h1>
        <button
          id="add_contact_btn"
          onClick={() => setShowAddModal(true)}
          className="p-2 rounded-full bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-white shadow-md transition-colors"
          aria-label="Add Contact"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3">
        <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-slate-400 focus-within:text-white transition-colors">
          <Search size={18} className="mr-2" />
          <input
            id="contact_search"
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-500 text-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Favorites section first */}
        {contacts.some((c) => c.isFavorite) && !searchQuery && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">Favorites</h2>
            <div className="grid grid-cols-4 gap-2">
               {contacts
                .filter((c) => c.isFavorite)
                .map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="flex flex-col items-center p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${contact.avatarColor} flex items-center justify-center font-bold text-sm text-white mb-1 shadow-md`}>
                      {getInitials(contact.name)}
                    </div>
                    <span className="text-xs font-medium truncate w-full text-center text-slate-200">
                      {contact.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <User size={40} className="stroke-1 mb-2" />
            <p className="text-sm">No contacts found</p>
          </div>
        ) : (
          Object.keys(groupedContacts)
            .sort()
            .map((letter) => (
              <div key={letter} className="mb-4">
                <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2 px-1">
                  {letter}
                </h2>
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                  {groupedContacts[letter].map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${contact.avatarColor} flex items-center justify-center font-bold text-sm text-white shadow-sm`}>
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{contact.name}</div>
                          <div className="text-xs text-slate-500">{contact.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onCallContact(contact.phone, contact.name)}
                          className="p-2 rounded-full text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Call"
                        >
                          <Phone size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex items-end justify-center p-4">
          <div className="bg-slate-900/85 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden animate-slide-up shadow-2xl">
            {/* Top Bar with Avatar */}
            <div className={`p-6 bg-gradient-to-tr ${selectedContact.avatarColor} flex flex-col items-center relative`}>
              <button
                onClick={() => setSelectedContact(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="w-20 h-20 rounded-full border-4 border-slate-950/80 bg-slate-800/80 flex items-center justify-center font-bold text-3xl text-white shadow-lg mb-2">
                {getInitials(selectedContact.name)}
              </div>
              <h2 className="text-xl font-bold text-white drop-shadow-sm">{selectedContact.name}</h2>
              <p className="text-xs text-white/80 mt-0.5">{selectedContact.phone}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-around p-4 border-b border-white/10 bg-white/[0.02]">
              <button
                onClick={() => {
                  onCallContact(selectedContact.phone, selectedContact.name);
                  setSelectedContact(null);
                }}
                className="flex flex-col items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <div className="p-3 bg-emerald-500/10 rounded-full"><Phone size={20} /></div>
                <span className="text-xs font-medium">Call</span>
              </button>

              <button
                onClick={() => onToggleFavorite(selectedContact.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  selectedContact.isFavorite ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className={`p-3 rounded-full ${selectedContact.isFavorite ? 'bg-amber-500/10' : 'bg-white/[0.05] border border-white/5'}`}>
                  <Star size={20} fill={selectedContact.isFavorite ? 'currentColor' : 'none'} />
                </div>
                <span className="text-xs font-medium">{selectedContact.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
              </button>

              <button
                onClick={() => handleEditClick(selectedContact)}
                className="flex flex-col items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <div className="p-3 bg-blue-500/10 rounded-full"><Edit2 size={20} /></div>
                <span className="text-xs font-medium">Edit</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedContact.name}?`)) {
                    onDeleteContact(selectedContact.id);
                    setSelectedContact(null);
                  }
                }}
                className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <div className="p-3 bg-red-500/10 rounded-full"><Trash2 size={20} /></div>
                <span className="text-xs font-medium">Delete</span>
              </button>
            </div>

            {/* Detailed Info */}
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3 text-slate-300 bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                <Phone size={18} className="text-slate-500" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500">Phone Number</div>
                  <div className="text-sm font-medium">{selectedContact.phone}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-300 bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                <Mail size={18} className="text-slate-500" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500">Email Address</div>
                  <div className="text-sm font-medium truncate">{selectedContact.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex items-center justify-center p-4">
          <div className="bg-slate-900/85 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">New Contact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
                <input
                  id="new_contact_name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
                <input
                  id="new_contact_phone"
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. (555) 012-3456"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  id="new_contact_email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-white/10">
                <span className="text-sm font-medium text-slate-300">Add to Favorites</span>
                <input
                  id="new_contact_favorite"
                  type="checkbox"
                  checked={newFavorite}
                  onChange={(e) => setNewFavorite(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 bg-white/[0.05] border-white/10 focus:ring-blue-500 focus:ring-offset-slate-950"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] text-sm font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit_new_contact"
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-sm font-medium text-white transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900/85 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white font-sans">Edit Contact</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
                <input
                  id="edit_contact_name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
                <input
                  id="edit_contact_phone"
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. (555) 012-3456"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  id="edit_contact_email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-white/10">
                <span className="text-sm font-medium text-slate-300">Add to Favorites</span>
                <input
                  id="edit_contact_favorite"
                  type="checkbox"
                  checked={editFavorite}
                  onChange={(e) => setEditFavorite(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 bg-white/[0.05] border-white/10 focus:ring-blue-500 focus:ring-offset-slate-950"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] text-sm font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit_edit_contact"
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-sm font-medium text-white transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
