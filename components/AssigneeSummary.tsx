import React from 'react';
import { Task, Status, Priority } from '../types';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  tasks: Task[];
}

const AssigneeSummary: React.FC<Props> = ({ tasks }) => {
  // Get unique assignees from tasks or use a predefined list if available
  // Here we derive from tasks to ensure we only show active people, 
  // but you could also import the fixed list from TaskForm if needed.
  const allAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)));
  
  // Sort assignees alphabetically
  allAssignees.sort();

  return (
    <div className="mb-8 animate-fade-in">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </span>
        สรุปงานรายบุคคล
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {allAssignees.length === 0 ? (
           <div className="col-span-full bg-white p-6 rounded-xl border border-slate-100 text-center text-slate-400">
             ยังไม่มีข้อมูลผู้รับผิดชอบงาน
           </div>
        ) : (
          allAssignees.map(assignee => {
            const userTasks = tasks.filter(t => t.assignee === assignee);
            const activeTasks = userTasks.filter(t => t.status !== Status.COMPLETED);
            const completedCount = userTasks.filter(t => t.status === Status.COMPLETED).length;
            
            // Calculate total budget
            const totalBudget = userTasks.reduce((sum, task) => {
                // Remove commas and non-numeric chars except . and -
                const cleanBudget = (task.budget || '0').toString().replace(/,/g, '');
                const val = parseFloat(cleanBudget);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);
            
            return (
              <div key={assignee} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col h-full hover:shadow-md transition">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-50">
                  <h4 className="font-semibold text-slate-800 text-sm">{assignee}</h4>
                  <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold">
                    รวม {userTasks.length}
                  </span>
                </div>
                
                <div className="flex-1 space-y-2 mb-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                  {activeTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-4">
                      <CheckCircle2 size={24} className="mb-1 text-green-100" />
                      <p className="text-xs">เคลียร์งานครบแล้ว</p>
                    </div>
                  ) : (
                    activeTasks.map(task => (
                      <div key={task.id} className="group flex items-start space-x-2 text-xs p-2 rounded border border-slate-50 hover:bg-blue-50 hover:border-blue-100 transition">
                        <div className="mt-0.5 shrink-0">
                          {task.priority === Priority.URGENT ? (
                            <AlertCircle size={14} className="text-red-500 animate-pulse" />
                          ) : task.status === Status.IN_PROGRESS ? (
                            <Clock size={14} className="text-blue-500" />
                          ) : (
                            <Circle size={14} className="text-slate-300 group-hover:text-blue-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700 truncate font-medium group-hover:text-blue-700">{task.title}</p>
                          <div className="flex justify-between items-center mt-0.5">
                            <span className="text-slate-400 text-[10px] truncate">{task.documentNumber !== '-' ? task.documentNumber : 'No Doc'}</span>
                            {task.priority === Priority.URGENT && (
                                <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">ด่วน</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-auto pt-2 border-t border-slate-50 text-xs bg-slate-50/50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle2 size={12} className="mr-1" /> เสร็จ {completedCount}
                    </span>
                    <span className={`${activeTasks.length > 0 ? 'text-amber-600' : 'text-slate-400'} font-medium`}>
                        คงค้าง {activeTasks.length}
                    </span>
                  </div>
                  {totalBudget > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-slate-500">
                        <span>งบประมาณรวม</span>
                        <span className="font-bold text-slate-700">฿{totalBudget.toLocaleString()}</span>
                      </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssigneeSummary;