
import React, { useState } from 'react';
import { Task, AppUser } from '../types';
import { prioritizeTasks } from '../services/geminiService';
import { checkTierLimit } from '../services/tierService';

interface TaskManagerProps {
  tasks: Task[];
  onUpdate: (tasks: Task[]) => void;
  user: AppUser;
  onUserUpdate: (user: AppUser) => void;
  onNavigateToPricing: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onUpdate, user, onUserUpdate, onNavigateToPricing }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const limitCheck = checkTierLimit(user, 'maxTasks');
    if (!limitCheck.allowed) {
      alert(`Limit reached! Your ${user.tier} tier allows max ${limitCheck.max} tasks.`);
      onNavigateToPricing();
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      priority: 0,
      completed: false,
      subtasks: [],
      energyLevel,
    };
    onUpdate([...tasks, newTask]);
    onUserUpdate({
      ...user,
      usage: { ...user.usage, tasksCount: (user.usage.tasksCount || 0) + 1 }
    });
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    onUpdate(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    onUpdate(tasks.filter(t => t.id !== id));
    onUserUpdate({
      ...user,
      usage: { ...user.usage, tasksCount: Math.max(0, (user.usage.tasksCount || 0) - 1) }
    });
  };

  const runOptimizer = async () => {
    const aiCheck = checkTierLimit(user, 'aiRequestsPerDay');
    if (!aiCheck.allowed) {
      alert(`AI limit reached for your ${user.tier} tier. Upgrade for more.`);
      onNavigateToPricing();
      return;
    }

    if (tasks.filter(t => !t.completed).length < 2) return;
    setIsOptimizing(true);
    try {
      const result = await prioritizeTasks(tasks.filter(t => !t.completed), energyLevel);
      const { recommended_order, reasoning } = result;
      
      const prioritized = [...tasks].sort((a, b) => {
        const indexA = recommended_order.indexOf(a.id);
        const indexB = recommended_order.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      onUpdate(prioritized);
      setAiInsight(reasoning);
      onUserUpdate({
        ...user,
        usage: { ...user.usage, aiRequestsToday: user.usage.aiRequestsToday + 1 }
      });
    } catch (e) {
       setAiInsight("Unable to prioritize at the moment. Focus on your most urgent task.");
    }
    setIsOptimizing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <form onSubmit={addTask} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 px-4 py-3 bg-[var(--bg-color)] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-[var(--text-color)]"
          />
          <div className="flex gap-2">
            <select 
              value={energyLevel} 
              onChange={(e) => setEnergyLevel(e.target.value as any)}
              className="px-4 py-3 bg-[var(--bg-color)] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none text-[var(--text-color)]"
            >
              <option value="low">Low Energy</option>
              <option value="medium">Medium Energy</option>
              <option value="high">High Energy</option>
            </select>
            <button 
              type="submit"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-primary/10 whitespace-nowrap"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center px-1">
         <h3 className="font-semibold text-[var(--text-color)] text-lg">Your Journey</h3>
         <button 
           onClick={runOptimizer}
           disabled={isOptimizing}
           className="flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-primary/10 text-primary font-bold rounded-xl border border-primary/20 hover:bg-primary/10 transition-all disabled:opacity-50 text-sm"
         >
            <i className={`fa-solid fa-wand-magic-sparkles ${isOptimizing ? 'animate-spin' : ''}`}></i>
            AI Prioritize
         </button>
      </div>

      {aiInsight && (
        <div className="bg-primary/5 dark:bg-primary/20 p-4 rounded-xl border border-primary/10 dark:border-primary/30 text-sm text-primary animate-in fade-in slide-in-from-top-4 font-medium leading-relaxed">
           <strong>AI Insight:</strong> {aiInsight}
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 && (
           <div className="text-center py-12 text-[var(--text-muted)] bg-[var(--surface-color)] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
             No tasks yet. Plan your day.
           </div>
        )}
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between p-4 bg-[var(--surface-color)] rounded-xl border transition-all ${
              task.completed ? 'opacity-50 border-gray-100 dark:border-gray-800' : 'border-gray-200 dark:border-gray-800 hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {task.completed && <i className="fa-solid fa-check text-[10px]"></i>}
              </button>
              <div className={task.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-color)] font-medium'}>
                {task.title}
                <div className="flex gap-2 mt-1">
                   <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter ${
                     task.energyLevel === 'high' ? 'bg-red-50 dark:bg-red-950/40 text-red-600' : 
                     task.energyLevel === 'medium' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' : 
                     'bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                   }`}>
                     {task.energyLevel} Energy
                   </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => deleteTask(task.id)}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-2"
            >
               <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
