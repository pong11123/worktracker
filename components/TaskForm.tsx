import React, { useState, useEffect } from 'react';
import { Priority, Status, Task } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>) => void;
}

const TaskForm: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [department, setDepartment] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [dueDate, setDueDate] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  // Set default date to today when form opens
  useEffect(() => {
    if (isOpen) {
      // Use local date string in YYYY-MM-DD format
      const today = new Date().toLocaleDateString('en-CA');
      setDateReceived(today);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      documentNumber,
      dateReceived: dateReceived ? new Date(dateReceived).toISOString() : new Date().toISOString(),
      department,
      building,
      floor,
      title,
      details,
      assignee,
      priority,
      status: Status.WAITING,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
    });
    // Reset
    setDepartment('');
    setBuilding('');
    setFloor('');
    setTitle('');
    setDetails('');
    setAssignee('');
    setPriority(Priority.NORMAL);
    setDueDate('');
    setDocumentNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">บันทึกงานใหม่</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">วันที่รับงาน</label>
              <input 
                required
                type="date" 
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เลขที่หนังสือ/ใบแจ้ง</label>
              <input 
                type="text" 
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="เช่น REQ-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อรายการงาน</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="ระบุชื่องาน..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดงาน</label>
            <textarea 
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              placeholder="รายละเอียดเพิ่มเติม..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยงาน</label>
              <input 
                required
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ระบุหน่วยงาน..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้รับผิดชอบ</label>
              <select 
                required
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">เลือกผู้รับผิดชอบ...</option>
                <option value="นายณัฐวุฒิ วันสุข">นายณัฐวุฒิ วันสุข</option>
                <option value="นายจักรวัตร เจียมจริยธรรม">นายจักรวัตร เจียมจริยธรรม</option>
                <option value="นายเรืองสิทธิ์ เจริญไพรัช">นายเรืองสิทธิ์ เจริญไพรัช</option>
                <option value="นายถิรธนา  วิเศษอุตร์">นายถิรธนา  วิเศษอุตร์</option>
                <option value="นายปิยะณัฐ ทรงพระ">นายปิยะณัฐ ทรงพระ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">อาคาร</label>
              <input 
                type="text" 
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ระบุอาคาร..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชั้น</label>
              <input 
                type="text" 
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ระบุชั้น..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ความสำคัญ</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={Priority.NORMAL}>ปกติ</option>
                <option value={Priority.URGENT}>ด่วนมาก</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">กำหนดส่ง (Optional)</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition transform active:scale-95"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;