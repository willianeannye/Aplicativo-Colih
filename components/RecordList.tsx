import React from 'react';
import { AttendanceRecord, Status, YesNo, User } from '../types';
import { Edit2, AlertCircle, CheckCircle } from 'lucide-react';

interface RecordListProps {
  records: AttendanceRecord[];
  currentUser: User;
  onEdit: (record: AttendanceRecord) => void;
}

export const RecordList: React.FC<RecordListProps> = ({ records, currentUser, onEdit }) => {
  
  const getRowStyle = (record: AttendanceRecord) => {
    // Logic 1: Finalized records go to green, unless problem exists.
    // Logic 2: If HLC-7 sent is NO, or Finalized is NO but Status is finalized (impossible via form validation but good to catch),
    // Prompt: "Se a resposta do ponto 5 for não, ele pode finalizar o atendimento, mas todo aquele atendimento vai ficar em vermelho"
    // Prompt: "Se a resposta do ponto 6 for não... todo atendimento deverá ficar destacado em vermelho"
    
    const isFinalized = record.status === Status.Finalized;
    const hlc7FinalizedYes = record.hlc7Finalized === YesNo.Yes;
    const hlc7SentYes = record.hlc7Sent === YesNo.Yes;

    // Red Condition:
    // 1. If Status is Finalized BUT HLC7 Finalized is NO.
    // 2. If HLC7 Sent is NO (regardless of status, acts as a warning).
    if ((isFinalized && !hlc7FinalizedYes) || !hlc7SentYes) {
      return "bg-red-50 border-l-4 border-red-500 hover:bg-red-100";
    }

    // Green Condition:
    // Finalized AND HLC7 Finalized YES AND HLC7 Sent YES.
    if (isFinalized && hlc7FinalizedYes && hlc7SentYes) {
      return "bg-green-50 border-l-4 border-green-500 hover:bg-green-100 text-gray-600";
    }

    // Default "In Progress" (White/Blueish)
    return "bg-white border-l-4 border-blue-500 hover:bg-blue-50";
  };

  const getTextStyle = (record: AttendanceRecord) => {
      const isFinalized = record.status === Status.Finalized;
      const hlc7FinalizedYes = record.hlc7Finalized === YesNo.Yes;
      const hlc7SentYes = record.hlc7Sent === YesNo.Yes;

      if ((isFinalized && !hlc7FinalizedYes) || !hlc7SentYes) {
        return "text-red-900";
      }
      return "text-gray-900";
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-6">
        Nenhum atendimento encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium uppercase tracking-wider">Grupo</th>
              <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium uppercase tracking-wider">Responsável</th>
              <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium uppercase tracking-wider">Paciente</th>
              <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium uppercase tracking-wider">Hospital</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">HLC-7 Fin.</th>
              <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Env. Sec.</th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Obs</th>
              <th className="px-2 md:px-4 py-3 text-right text-[10px] md:text-xs font-medium uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {records.map((record) => {
              const rowClass = getRowStyle(record);
              const textClass = getTextStyle(record);
              
              // Permission check: Can only edit if created by self OR is Manager
              const canEdit = currentUser.role === 'Manager' || record.createdByUserId === currentUser.id;

              return (
                <tr key={record.id} className={`${rowClass} transition-colors`}>
                  <td className={`px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-semibold ${textClass}`}>
                    {record.group}
                  </td>
                  <td className={`px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm max-w-[70px] sm:max-w-[100px] md:max-w-xs truncate ${textClass}`}>
                    {record.responsibleMember}
                  </td>
                  <td className={`px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-bold ${textClass}`}>
                    {record.patientInitials}
                  </td>
                  <td className={`px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm max-w-[70px] sm:max-w-[100px] md:max-w-xs truncate ${textClass}`}>
                    {record.hospital}
                  </td>
                  <td className={`hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm ${textClass}`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === Status.Finalized ? 'bg-green-200 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className={`hidden md:table-cell px-4 py-4 whitespace-nowrap text-center text-sm ${textClass}`}>
                    {record.hlc7Finalized === YesNo.Yes ? <CheckCircle size={18} className="inline text-green-600"/> : <AlertCircle size={18} className="inline text-red-500"/>}
                  </td>
                  <td className={`hidden md:table-cell px-4 py-4 whitespace-nowrap text-center text-sm ${textClass}`}>
                    {record.hlc7Sent === YesNo.Yes ? <CheckCircle size={18} className="inline text-green-600"/> : <AlertCircle size={18} className="inline text-red-500"/>}
                  </td>
                  <td className={`hidden lg:table-cell px-4 py-4 text-sm max-w-xs truncate ${textClass}`} title={record.observations}>
                    {record.observations}
                  </td>
                  <td className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                    {canEdit && (
                      <button onClick={() => onEdit(record)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100">
                        <Edit2 size={16} className="md:w-5 md:h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
