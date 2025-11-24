import React, { useState, useEffect } from 'react';
import { AttendanceRecord, GroupName, Status, YesNo, User } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { STATUS_OPTIONS, YES_NO_OPTIONS } from '../constants';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'>) => void;
  initialData?: AttendanceRecord;
  currentUser: User;
}

export const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  currentUser
}) => {
  const [formData, setFormData] = useState({
    responsibleMember: '',
    patientInitials: '',
    hospital: '',
    status: '',
    hlc7Finalized: '',
    hlc7Sent: '',
    observations: '',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        responsibleMember: initialData.responsibleMember,
        patientInitials: initialData.patientInitials,
        hospital: initialData.hospital,
        status: initialData.status,
        hlc7Finalized: initialData.hlc7Finalized,
        hlc7Sent: initialData.hlc7Sent,
        observations: initialData.observations,
      });
    } else {
      // Defaults
      setFormData({
        responsibleMember: currentUser.role === 'Member' ? currentUser.name : '',
        patientInitials: '',
        hospital: '',
        status: Status.InProgress,
        hlc7Finalized: YesNo.No,
        hlc7Sent: YesNo.No,
        observations: '',
      });
    }
    setErrors({});
    setCustomError(null);
  }, [initialData, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
    setCustomError(null);
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    // Removed 'observations' from required fields
    const fields = ['responsibleMember', 'patientInitials', 'hospital', 'status', 'hlc7Finalized', 'hlc7Sent'];
    
    fields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        group: (initialData ? initialData.group : currentUser.group) || GroupName.GrupoA, // Fallback or preserve
        status: formData.status as Status,
        hlc7Finalized: formData.hlc7Finalized as YesNo,
        hlc7Sent: formData.hlc7Sent as YesNo,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-blue-800">
            {initialData ? 'Editar Atendimento' : 'Novo Atendimento'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {customError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {customError}
            </div>
          )}

          <Input
            label="Membro Responsável"
            name="responsibleMember"
            value={formData.responsibleMember}
            onChange={handleChange}
            error={errors.responsibleMember}
            errorMessage="Campo obrigatório"
            readOnly={currentUser.role === 'Member' && !!initialData} // Members can't change owner if editing? 
          />

          <Input
            label="Nome do Paciente (Iniciais)"
            name="patientInitials"
            value={formData.patientInitials}
            onChange={handleChange}
            error={errors.patientInitials}
            errorMessage="Campo obrigatório"
            placeholder="Ex: J.S.A."
            maxLength={5}
          />

          <Input
            label="Hospital"
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            error={errors.hospital}
            errorMessage="Campo obrigatório"
          />

          <Select
            label="HLC-7 Finalizado?"
            name="hlc7Finalized"
            value={formData.hlc7Finalized}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
            error={errors.hlc7Finalized}
            errorMessage="Campo obrigatório"
          />

          <Select
            label="HLC-7 Enviado ao Secretário?"
            name="hlc7Sent"
            value={formData.hlc7Sent}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
            error={errors.hlc7Sent}
            errorMessage="Campo obrigatório"
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            error={errors.status}
            errorMessage="Campo obrigatório"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                errors.observations
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};