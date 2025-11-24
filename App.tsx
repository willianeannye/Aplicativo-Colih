import React, { useState, useEffect, useMemo } from 'react';
import { User, AttendanceRecord, FilterState, Status, YesNo, GroupName } from './types';
import { AuthMock } from './components/AuthMock';
import { RecordList } from './components/RecordList';
import { FormModal } from './components/FormModal';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Select } from './components/Select';
import { STATUS_OPTIONS, YES_NO_OPTIONS, GROUPS } from './constants';
import { Plus, Filter, LogOut, Layout } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    responsibleMember: '',
    patientInitials: '',
    hospital: '',
    status: '',
    hlc7Finalized: '',
    hlc7Sent: '',
  });

  // --- Effects ---
  
  // Load user from session storage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('colih_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const storedRecords = localStorage.getItem('colih_records');
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, []);

  // Save records to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('colih_records', JSON.stringify(records));
  }, [records]);

  // --- Handlers ---

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('colih_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('colih_user');
  };

  const handleSaveRecord = (data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'>) => {
    if (!user) return;

    if (editingRecord) {
      // Update existing
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? {
        ...r,
        ...data,
        updatedAt: Date.now(),
      } : r));
    } else {
      // Create new
      const newRecord: AttendanceRecord = {
        ...data,
        id: Date.now().toString(), // Simple ID
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdByUserId: user.id
      };
      setRecords(prev => [...prev, newRecord]);
    }
    setEditingRecord(undefined);
  };

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRecord(undefined);
    setIsModalOpen(true);
  };

  // --- Filtering & Sorting Logic ---
  const filteredAndSortedRecords = useMemo(() => {
    if (!user) return [];

    let result = [...records];

    // 1. Access Control Filter
    if (user.role === 'Member' && user.group) {
      result = result.filter(r => r.group === user.group);
    }

    // 2. UI Filters
    if (filters.responsibleMember) {
      result = result.filter(r => r.responsibleMember.toLowerCase().includes(filters.responsibleMember.toLowerCase()));
    }
    if (filters.patientInitials) {
      result = result.filter(r => r.patientInitials.toLowerCase().includes(filters.patientInitials.toLowerCase()));
    }
    if (filters.hospital) {
      result = result.filter(r => r.hospital.toLowerCase().includes(filters.hospital.toLowerCase()));
    }
    if (filters.status) {
      result = result.filter(r => r.status === filters.status);
    }
    if (filters.hlc7Finalized) {
      result = result.filter(r => r.hlc7Finalized === filters.hlc7Finalized);
    }
    if (filters.hlc7Sent) {
      result = result.filter(r => r.hlc7Sent === filters.hlc7Sent);
    }

    // 3. Sorting: Finalized go to bottom, Green records (fully complete) even lower or same?
    // Requirement: "os atendimentos que já foram finalizados vão para o final da lista"
    result.sort((a, b) => {
      // If statuses are different, prioritize In Progress
      if (a.status !== b.status) {
        return a.status === Status.InProgress ? -1 : 1;
      }
      // If statuses are same, sort by recent date (newest first)
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [records, user, filters]);

  // --- Render ---

  if (!user) {
    return <AuthMock onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <Layout className="h-6 w-6 text-blue-300" />
             <h1 className="text-xl font-bold truncate">Atendimentos Colih Salvador</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-blue-200">{user.group || 'Gestão Geral'}</div>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-full hover:bg-blue-700 transition text-blue-200 hover:text-white"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
             <h2 className="text-2xl font-bold text-gray-800">
               {user.role === 'Manager' ? 'Visão Geral' : `Atendimentos - ${user.group}`}
             </h2>
             <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
               {filteredAndSortedRecords.length}
             </span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter size={16} />
              Filtros
            </Button>
            {user.role === 'Member' && (
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus size={16} />
                Novo Atendimento
              </Button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-down">
             <div className="md:col-span-1">
               <Input 
                  label="Responsável" 
                  value={filters.responsibleMember} 
                  onChange={e => setFilters({...filters, responsibleMember: e.target.value})} 
                  className="mb-0"
               />
             </div>
             <div className="md:col-span-1">
               <Input 
                  label="Paciente (Iniciais)" 
                  value={filters.patientInitials} 
                  onChange={e => setFilters({...filters, patientInitials: e.target.value})} 
                  className="mb-0"
               />
             </div>
             <div className="md:col-span-1">
               <Input 
                  label="Hospital" 
                  value={filters.hospital} 
                  onChange={e => setFilters({...filters, hospital: e.target.value})} 
                  className="mb-0"
               />
             </div>
             <div className="md:col-span-1">
               <Select 
                  label="Status" 
                  options={STATUS_OPTIONS}
                  value={filters.status} 
                  onChange={e => setFilters({...filters, status: e.target.value})} 
                  className="mb-0"
               />
             </div>
             <div className="md:col-span-1">
               <Select 
                  label="HLC-7 Fin." 
                  options={YES_NO_OPTIONS}
                  value={filters.hlc7Finalized} 
                  onChange={e => setFilters({...filters, hlc7Finalized: e.target.value})} 
                  className="mb-0"
               />
             </div>
             <div className="md:col-span-1">
               <Select 
                  label="Env. Secretário" 
                  options={YES_NO_OPTIONS}
                  value={filters.hlc7Sent} 
                  onChange={e => setFilters({...filters, hlc7Sent: e.target.value})} 
                  className="mb-0"
               />
             </div>
             <div className="md:col-span-6 flex justify-end">
                <button 
                  onClick={() => setFilters({responsibleMember: '', patientInitials: '', hospital: '', status: '', hlc7Finalized: '', hlc7Sent: ''})}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Limpar Filtros
                </button>
             </div>
          </div>
        )}

        {/* Table List */}
        <RecordList 
          records={filteredAndSortedRecords} 
          currentUser={user} 
          onEdit={handleEditClick} 
        />
      </main>

      {/* Form Modal */}
      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveRecord}
        initialData={editingRecord}
        currentUser={user}
      />
    </div>
  );
};

export default App;