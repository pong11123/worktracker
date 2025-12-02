import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Task, Status } from '../types';

interface Props {
  tasks: Task[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const Charts: React.FC<Props> = ({ tasks }) => {
  // Process data for charts
  
  // Tasks by Assignee
  const assigneeMap = tasks.reduce((acc: any, task) => {
    acc[task.assignee] = (acc[task.assignee] || 0) + 1;
    return acc;
  }, {});
  const assigneeData = Object.keys(assigneeMap).map(key => ({
    name: key,
    tasks: assigneeMap[key]
  }));

  // Tasks by Status
  const statusData = [
    { name: 'รอทำ', value: tasks.filter(t => t.status === Status.WAITING).length },
    { name: 'กำลังทำ', value: tasks.filter(t => t.status === Status.IN_PROGRESS).length },
    { name: 'เสร็จสิ้น', value: tasks.filter(t => t.status === Status.COMPLETED).length },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">งานรายบุคคล</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assigneeData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">สถานะงานรวม</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
           {statusData.map((entry, index) => (
             <div key={index} className="flex items-center text-xs text-slate-500">
               <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[index]}}></span>
               {entry.name} ({entry.value})
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Charts;