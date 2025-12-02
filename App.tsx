import React, { useState, useEffect, useMemo } from 'react';
import { Task, Status, Priority, DashboardStats } from './types';
import { taskService } from './services/taskService';
import { analyzeTasks } from './services/geminiService';
import TaskForm from './components/TaskForm';
import TaskTable from './components/TaskTable';
import DashboardStatsCards from './components/DashboardStats';
import Charts from './components/Charts';
import AssigneeSummary from './components/AssigneeSummary';
import { Plus, LayoutDashboard, List, Sparkles, Download, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const ASSIGNEES = [
  "นายณัฐวุฒิ วันสุข",
  "นายจักรวัตร เจียมจริยธรรม",
  "นายเรืองสิทธิ์ เจริญไพรัช",
  "นายถิรธนา  วิเศษอุตร์",
  "นายปิยะณัฐ ทรงพระ"
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Filter Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dateReceived);
      
      // Date Range Filter
      if (filterStartDate) {
        const start = new Date(filterStartDate);
        start.setHours(0, 0, 0, 0);
        if (taskDate < start) return false;
      }
      
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        if (taskDate > end) return false;
      }

      // Assignee Filter
      if (filterAssignee && task.assignee !== filterAssignee) {
        return false;
      }

      return true;
    });
  }, [tasks, filterStartDate, filterEndDate, filterAssignee]);

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    // Optimistic UI update could happen here, but for simplicity we await
    try {
      const savedTask = await taskService.add(newTask);
      setTasks(prev => [savedTask, ...prev]);
    } catch (error) {
      alert("Failed to add task. Please check your connection.");
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Status) => {
    const updatedTask = { ...task, status: newStatus };
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    
    try {
      const processedTask = await taskService.update(updatedTask);
      // Update again with server response (e.g. calculated dates)
      setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
    } catch (error) {
      console.error("Update failed", error);
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  };

  const handleDateChange = async (task: Task, newDate: string) => {
    const updatedTask = { ...task, dateCompleted: newDate };
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));

    try {
      const processedTask = await taskService.update(updatedTask);
      setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
    } catch (error) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  };

  const handleBudgetChange = async (task: Task, newBudget: string) => {
    const updatedTask = { ...task, budget: newBudget };
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    
    try {
      const processedTask = await taskService.update(updatedTask);
      setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
    } catch (error) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== id));
      await taskService.delete(id);
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      // Reload tasks to revert UI state if delete failed
      loadTasks();
    }
  };

  const handleGenerateInsight = async () => {
    setIsAiLoading(true);
    // Analyze filtered tasks so insights are relevant to current view
    const result = await analyzeTasks(filteredTasks);
    setAiInsight(result);
    setIsAiLoading(false);
  };

  const handleExportCSV = () => {
    // Define headers in Thai
    const headers = [
      "วันที่รับงาน",
      "เลขที่เอกสาร",
      "ชื่องาน",
      "รายละเอียด",
      "หน่วยงาน",
      "อาคาร",
      "ชั้น",
      "ผู้รับผิดชอบ",
      "ความสำคัญ",
      "สถานะ",
      "วันที่เสร็จ",
      "งบประมาณ"
    ];

    // Convert filtered tasks to CSV rows
    const rows = filteredTasks.map(task => [
      task.dateReceived ? format(new Date(task.dateReceived), 'dd/MM/yyyy') : '',
      `"${(task.documentNumber || '').replace(/"/g, '""')}"`, // Handle document number as string to prevent scientific notation in excel
      `"${(task.title || '').replace(/"/g, '""')}"`, // Escape quotes
      `"${(task.details || '').replace(/"/g, '""')}"`,
      `"${(task.department || '').replace(/"/g, '""')}"`,
      `"${(task.building || '').replace(/"/g, '""')}"`,
      `"${(task.floor || '').replace(/"/g, '""')}"`,
      `"${(task.assignee || '').replace(/"/g, '""')}"`,
      task.priority === Priority.URGENT ? 'ด่วนมาก' : 'ปกติ',
      task.status === Status.WAITING ? 'รอทำ' : task.status === Status.IN_PROGRESS ? 'กำลังทำ' : 'เสร็จสิ้น',
      task.dateCompleted ? format(new Date(task.dateCompleted), 'dd/MM/yyyy') : '',
      task.budget ? `"${task.budget.replace(/"/g, '""')}"` : ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob with BOM for Excel compatibility with Thai characters
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `work_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo<DashboardStats>(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === Status.COMPLETED).length;
    const pending = filteredTasks.filter(t => t.status === Status.WAITING).length;
    const inProgress = filteredTasks.filter(t => t.status === Status.IN_PROGRESS).length;
    const urgent = filteredTasks.filter(t => t.priority === Priority.URGENT).length;
    
    const now = new Date();
    const overdue = filteredTasks.filter(t => 
      t.status !== Status.COMPLETED && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length;

    return { total, completed, pending, inProgress, urgent, overdue };
  }, [filteredTasks]);

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterAssignee('');
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-1.5 rounded-lg mr-3">
                 <LayoutDashboard className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">WorkTrack Pro</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportCSV}
                className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition hidden sm:flex"
              >
                <Download size={18} className="mr-2" />
                ส่งออกไฟล์
              </button>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md transition transform active:scale-95"
              >
                <Plus size={18} className="mr-2" />
                รับงานใหม่
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filter Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-8 animate-fade-in">
          <div className="flex items-center mb-4 text-slate-800 font-bold text-sm uppercase tracking-wide">
            <Filter size={16} className="mr-2 text-blue-600" />
            ตัวกรองข้อมูล (Filter)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">ตั้งแต่วันที่</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">ถึงวันที่</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">ผู้รับผิดชอบ</label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white"
              >
                <option value="">ทั้งหมด</option>
                {ASSIGNEES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
               <button
                 onClick={clearFilters}
                 className="w-full h-[38px] flex items-center justify-center text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition"
               >
                 <RefreshCw size={14} className="mr-2" />
                 ล้างค่า
               </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center transition ${
              activeTab === 'dashboard' 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <LayoutDashboard size={18} className="mr-2" />
            แดชบอร์ด
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center transition ${
              activeTab === 'list' 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <List size={18} className="mr-2" />
            รายการงาน ({filteredTasks.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in">
                 <DashboardStatsCards stats={stats} />
                 
                 {/* AI Insights Section */}
                 <div className="bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center">
                        <Sparkles className="w-6 h-6 mr-2 text-yellow-300" />
                        <h2 className="text-lg font-bold">AI Assistant Analyst</h2>
                     </div>
                     <button 
                      onClick={handleGenerateInsight}
                      disabled={isAiLoading}
                      className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition backdrop-blur-sm disabled:opacity-50"
                     >
                       {isAiLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ข้อมูลงาน'}
                     </button>
                   </div>
                   
                   {aiInsight ? (
                     <div className="bg-white/10 rounded-lg p-4 text-sm leading-relaxed backdrop-blur-sm border border-white/10">
                       {aiInsight}
                     </div>
                   ) : (
                     <p className="text-white/80 text-sm">
                       กดปุ่ม "วิเคราะห์ข้อมูลงาน" เพื่อให้ AI ช่วยสรุปสถานะงาน ค้นหาคอขวด และแนะนำการจัดการความสำคัญ (อ้างอิงจากข้อมูลที่กรองอยู่)
                     </p>
                   )}
                 </div>

                 {/* Assignee Summary Component - Uses Filtered Tasks */}
                 <AssigneeSummary tasks={filteredTasks} />

                 <Charts tasks={filteredTasks} />

                 {/* Recent Tasks Preview */}
                 <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">งานล่าสุด (5 รายการแรกตามตัวกรอง)</h3>
                    <TaskTable 
                      tasks={filteredTasks.slice(0, 5)} 
                      onStatusChange={handleStatusChange} 
                      onDateChange={handleDateChange} 
                      onBudgetChange={handleBudgetChange}
                      onDelete={handleDeleteTask}
                    />
                 </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="animate-fade-in">
                <TaskTable 
                  tasks={filteredTasks} 
                  onStatusChange={handleStatusChange} 
                  onDateChange={handleDateChange} 
                  onBudgetChange={handleBudgetChange}
                  onDelete={handleDeleteTask}
                />
              </div>
            )}
          </>
        )}
      </main>

      <TaskForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddTask}
      />
      
      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
        WorkTrack Pro Demo &copy; {new Date().getFullYear()} <br/>
        Connected to Firebase Firestore
      </footer>
    </div>
  );
}