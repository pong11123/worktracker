import React from 'react';
import { Task, Priority, Status } from '../types';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface Props {
  tasks: Task[];
  onStatusChange: (task: Task, newStatus: Status) => void;
  onDateChange: (task: Task, newDate: string) => void;
  onBudgetChange: (task: Task, newBudget: string) => void;
  onDelete: (id: string) => void;
}

const TaskTable: React.FC<Props> = ({ tasks, onStatusChange, onDateChange, onBudgetChange, onDelete }) => {
  const getStatusColor = (status: Status) => {
    switch(status) {
      case Status.WAITING: return 'bg-slate-100 text-slate-600';
      case Status.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case Status.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    return priority === Priority.URGENT 
      ? 'text-red-600 bg-red-50 border border-red-200' 
      : 'text-slate-600 bg-slate-50 border border-slate-200';
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-4 font-semibold whitespace-nowrap">วันที่รับงาน</th>
              <th className="p-4 font-semibold whitespace-nowrap">เลขที่เอกสาร</th>
              <th className="p-4 font-semibold min-w-[150px]">ชื่องาน</th>
              <th className="p-4 font-semibold min-w-[200px]">รายละเอียด</th>
              <th className="p-4 font-semibold">หน่วยงาน</th>
              <th className="p-4 font-semibold">อาคาร</th>
              <th className="p-4 font-semibold">ชั้น</th>
              <th className="p-4 font-semibold min-w-[150px]">ผู้รับผิดชอบ</th>
              <th className="p-4 font-semibold">ความสำคัญ</th>
              <th className="p-4 font-semibold">สถานะ</th>
              <th className="p-4 font-semibold whitespace-nowrap">วันที่เสร็จ</th>
              <th className="p-4 font-semibold whitespace-nowrap">งบประมาณ</th>
              <th className="p-4 font-semibold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-8 text-center text-slate-400">ไม่พบข้อมูลงาน</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                    {format(new Date(task.dateReceived), 'dd/MM/yyyy')}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">
                    {task.documentNumber || '-'}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{task.title}</td>
                  <td className="p-4 text-sm text-slate-500 text-xs max-w-[250px] truncate" title={task.details}>
                    {task.details || '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{task.department}</td>
                  <td className="p-4 text-sm text-slate-600">{task.building || '-'}</td>
                  <td className="p-4 text-sm text-slate-600">{task.floor || '-'}</td>
                  <td className="p-4 text-sm text-slate-600">{task.assignee}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === Priority.URGENT ? 'ด่วนมาก' : 'ปกติ'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task, e.target.value as Status)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer outline-none appearance-none ${getStatusColor(task.status)}`}
                    >
                      <option value={Status.WAITING}>รอทำ</option>
                      <option value={Status.IN_PROGRESS}>กำลังทำ</option>
                      <option value={Status.COMPLETED}>เสร็จสิ้น</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                    {task.status === Status.COMPLETED ? (
                      <input 
                        type="date"
                        value={task.dateCompleted ? new Date(task.dateCompleted).toLocaleDateString('en-CA') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                             const d = new Date(e.target.value);
                             onDateChange(task, d.toISOString());
                          }
                        }}
                        className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 shadow-sm outline-none"
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                    {task.status === Status.COMPLETED ? (
                      <input 
                        type="text"
                        value={task.budget || ''}
                        onChange={(e) => onBudgetChange(task, e.target.value)}
                        placeholder="ระบุ..."
                        className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 w-24 shadow-sm outline-none"
                      />
                    ) : (
                      task.budget ? task.budget : '-'
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeleteClick(task.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบรายการ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;