'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { RoutineBlock } from './ADHDRoutineTracker';

interface RoutineScheduleProps {
  routine: RoutineBlock[];
  onUpdateRoutine: (routine: RoutineBlock[]) => void;
  onToggleCompletion: (id: string) => void;
}

const blockTypes = [
  { value: 'work', label: 'Work', color: 'bg-blue-500', icon: '💼' },
  { value: 'side-project', label: 'Side Project', color: 'bg-purple-500', icon: '🚀' },
  { value: 'break', label: 'Break', color: 'bg-green-500', icon: '☕' },
  { value: 'personal', label: 'Personal', color: 'bg-orange-500', icon: '🏠' }
] as const;

// Helper to reorder array
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function RoutineSchedule({ routine, onUpdateRoutine, onToggleCompletion }: RoutineScheduleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getCurrentTimeBlock = () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    return routine.find(block => {
      return currentTime >= block.startTime && currentTime <= block.endTime;
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getBlockTypeInfo = (type: string) => {
    return blockTypes.find(bt => bt.value === type) || blockTypes[0];
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    const duration = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const handleEditBlock = (block: RoutineBlock) => {
    setEditingBlock({ ...block });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editingBlock) return;
    
    const updatedRoutine = routine.map(block =>
      block.id === editingBlock.id ? editingBlock : block
    );
    onUpdateRoutine(updatedRoutine);
    setIsEditing(false);
    setEditingBlock(null);
  };

  const handleDeleteBlock = (id: string) => {
    const updatedRoutine = routine.filter(block => block.id !== id);
    onUpdateRoutine(updatedRoutine);
  };

  const handleAddBlock = (newBlock: Omit<RoutineBlock, 'id'>) => {
    const id = Date.now().toString();
    const blockWithId = { ...newBlock, id };
    onUpdateRoutine([...routine, blockWithId]);
    setShowAddForm(false);
  };

  // Drag-and-drop handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const newRoutine = reorder(routine, result.source.index, result.destination.index);
    onUpdateRoutine(newRoutine);
  };

  const currentBlock = getCurrentTimeBlock();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          📅 Daily Schedule
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            + Add Block
          </button>
          <button
            onClick={() => {
              const confirmed = confirm('Reset to default schedule?');
              if (confirmed) {
                // Reset completed status for all blocks
                const resetRoutine = routine.map(block => ({ ...block, completed: false }));
                onUpdateRoutine(resetRoutine);
              }
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            🔄 Reset Day
          </button>
        </div>
      </div>

      {/* Schedule Timeline */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="routine-schedule">
          {(provided) => (
            <div
              className="space-y-3"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {routine.map((block, idx) => {
                const typeInfo = getBlockTypeInfo(block.type);
                const isCurrentBlock = currentBlock?.id === block.id;
                const duration = calculateDuration(block.startTime, block.endTime);

                return (
                  <Draggable key={block.id} draggableId={block.id} index={idx}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                          isCurrentBlock 
                            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                        } ${block.completed ? 'opacity-75' : ''} ${dragSnapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                        style={dragProvided.draggableProps.style}
                      >
                        {/* Drag Handle Icon */}
                        <span className="cursor-grab mr-2 text-gray-400 hover:text-blue-500" title="Drag to reorder">↕️</span>

                        {/* Time */}
                        <div className="flex-shrink-0 w-24 text-sm text-gray-600 dark:text-gray-400">
                          <div>{formatTime(block.startTime)}</div>
                          <div>{formatTime(block.endTime)}</div>
                        </div>

                        {/* Block Type Indicator */}
                        <div className={`w-4 h-16 rounded-full mx-4 ${typeInfo.color}`}></div>

                        {/* Block Content */}
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{typeInfo.icon}</span>
                            <h4 className={`font-medium ${
                              block.completed 
                                ? 'line-through text-gray-500' 
                                : 'text-gray-800 dark:text-white'
                            }`}>
                              {block.name}
                            </h4>
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                              {duration}
                            </span>
                            {isCurrentBlock && (
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded animate-pulse">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {typeInfo.label}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onToggleCompletion(block.id)}
                            className={`p-2 rounded-full transition-colors ${
                              block.completed 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                            title={block.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {block.completed ? '✓' : '○'}
                          </button>
                          <button
                            onClick={() => handleEditBlock(block)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Edit block"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Delete block"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Block Modal */}
      {isEditing && editingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              Edit Block
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={editingBlock.name}
                  onChange={(e) => setEditingBlock({ ...editingBlock, name: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={editingBlock.type}
                  onChange={(e) => setEditingBlock({ 
                    ...editingBlock, 
                    type: e.target.value as RoutineBlock['type'],
                    color: getBlockTypeInfo(e.target.value).color
                  })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  {blockTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingBlock.startTime}
                    onChange={(e) => setEditingBlock({ ...editingBlock, startTime: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingBlock.endTime}
                    onChange={(e) => setEditingBlock({ ...editingBlock, endTime: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingBlock(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Block Modal */}
      {showAddForm && (
        <AddBlockForm
          onAdd={handleAddBlock}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

// Add Block Form Component
function AddBlockForm({ 
  onAdd, 
  onCancel 
}: { 
  onAdd: (block: Omit<RoutineBlock, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'work' as RoutineBlock['type'],
    startTime: '09:00',
    endTime: '10:00',
    completed: false,
    color: 'bg-blue-500'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    const typeInfo = blockTypes.find(bt => bt.value === formData.type) || blockTypes[0];
    onAdd({ ...formData, color: typeInfo.color });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw]">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Add New Block
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., Morning Work Session"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                type: e.target.value as RoutineBlock['type']
              })}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              {blockTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}