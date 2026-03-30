import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Calendar, Clock, CreditCard as Edit2, Trash2, Plus, Save, ArrowLeft } from 'lucide-react';

interface TripDay {
  id: string;
  day: number;
  activities: Activity[];
}

interface Activity {
  id: string;
  time: string;
  description: string;
}

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [tripDate, setTripDate] = useState<string>(() => {
    // Set default date to 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  
  const [days, setDays] = useState<TripDay[]>(() => {
    const savedPlan = localStorage.getItem('tripPlan');
    if (savedPlan) {
      return JSON.parse(savedPlan);
    }
    
    // Create 5 default days
    return Array.from({ length: 5 }, (_, i) => ({
      id: uuidv4(),
      day: i + 1,
      activities: [
        {
          id: uuidv4(),
          time: '09:00',
          description: 'Breakfast at hotel',
        },
        {
          id: uuidv4(),
          time: '10:30',
          description: 'Sightseeing',
        },
        {
          id: uuidv4(),
          time: '13:00',
          description: 'Lunch',
        },
      ],
    }));
  });
  
  const [countdownDays, setCountdownDays] = useState<number>(0);
  const [editActivityId, setEditActivityId] = useState<string | null>(null);
  const [newActivityText, setNewActivityText] = useState<string>('');
  const [newActivityTime, setNewActivityTime] = useState<string>('12:00');
  
  useEffect(() => {
    localStorage.setItem('tripPlan', JSON.stringify(days));
  }, [days]);
  
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const tripDateObj = new Date(tripDate);
      const diffTime = tripDateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setCountdownDays(diffDays);
    };
    
    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000 * 60 * 60); // Update every hour
    
    return () => clearInterval(timer);
  }, [tripDate]);
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;
    
    if (sourceDroppableId === 'days') {
      // Reordering days
      const newDays = [...days];
      const [movedDay] = newDays.splice(result.source.index, 1);
      newDays.splice(result.destination.index, 0, movedDay);
      
      // Renumber days
      const reorderedDays = newDays.map((day, index) => ({
        ...day,
        day: index + 1,
      }));
      
      setDays(reorderedDays);
    } else if (sourceDroppableId === destinationDroppableId) {
      // Reordering activities within the same day
      const dayId = sourceDroppableId;
      const dayIndex = days.findIndex((day) => day.id === dayId);
      
      if (dayIndex !== -1) {
        const newDays = [...days];
        const dayActivities = [...newDays[dayIndex].activities];
        const [movedActivity] = dayActivities.splice(result.source.index, 1);
        dayActivities.splice(result.destination.index, 0, movedActivity);
        
        newDays[dayIndex] = {
          ...newDays[dayIndex],
          activities: dayActivities,
        };
        
        setDays(newDays);
      }
    } else {
      // Moving activity between days
      const sourceDayIndex = days.findIndex((day) => day.id === sourceDroppableId);
      const destDayIndex = days.findIndex((day) => day.id === destinationDroppableId);
      
      if (sourceDayIndex !== -1 && destDayIndex !== -1) {
        const newDays = [...days];
        const sourceDayActivities = [...newDays[sourceDayIndex].activities];
        const destDayActivities = [...newDays[destDayIndex].activities];
        
        const [movedActivity] = sourceDayActivities.splice(result.source.index, 1);
        destDayActivities.splice(result.destination.index, 0, movedActivity);
        
        newDays[sourceDayIndex] = {
          ...newDays[sourceDayIndex],
          activities: sourceDayActivities,
        };
        
        newDays[destDayIndex] = {
          ...newDays[destDayIndex],
          activities: destDayActivities,
        };
        
        setDays(newDays);
      }
    }
  };
  
  const handleAddActivity = (dayId: string) => {
    if (newActivityText.trim() === '') return;
    
    const newActivity: Activity = {
      id: uuidv4(),
      time: newActivityTime,
      description: newActivityText.trim(),
    };
    
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: [...day.activities, newActivity].sort((a, b) =>
                a.time.localeCompare(b.time)
              ),
            }
          : day
      )
    );
    
    setNewActivityText('');
  };
  
  const handleEditActivity = (dayId: string, activityId: string, newDescription: string, newTime: string) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities
                .map((activity) =>
                  activity.id === activityId
                    ? { ...activity, description: newDescription, time: newTime }
                    : activity
                )
                .sort((a, b) => a.time.localeCompare(b.time)),
            }
          : day
      )
    );
    
    setEditActivityId(null);
  };
  
  const handleDeleteActivity = (dayId: string, activityId: string) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.filter((activity) => activity.id !== activityId),
            }
          : day
      )
    );
  };
  
  const handleAddDay = () => {
    const newDay: TripDay = {
      id: uuidv4(),
      day: days.length + 1,
      activities: [],
    };
    
    setDays([...days, newDay]);
  };
  
  const handleDeleteDay = (dayId: string) => {
    if (days.length <= 1) return;
    
    const filteredDays = days.filter((day) => day.id !== dayId);
    const reorderedDays = filteredDays.map((day, index) => ({
      ...day,
      day: index + 1,
    }));
    
    setDays(reorderedDays);
  };
  
  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Trip Planner</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Plan your daily activities, organize your itinerary, and count down to your adventure!
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tripDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip Start Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="tripDate"
                      value={tripDate}
                      onChange={(e) => setTripDate(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-full text-center p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-100 dark:border-primary-800">
                    <h3 className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">
                      Countdown to Your Trip
                    </h3>
                    <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                      {countdownDays <= 0 ? (
                        countdownDays === 0 ? "Today's the day!" : "Trip in progress!"
                      ) : (
                        <>
                          {countdownDays} <span className="text-lg">days</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Daily Itinerary</h2>
              <button
                onClick={handleAddDay}
                className="btn btn-primary inline-flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Day
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="days" type="day">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-6"
                  >
                    {days.map((day, index) => (
                      <Draggable key={day.id} draggableId={day.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="bg-gray-100 dark:bg-gray-700 px-6 py-4 flex justify-between items-center cursor-move"
                            >
                              <h3 className="text-lg font-semibold">Day {day.day}</h3>
                              <button
                                onClick={() => handleDeleteDay(day.id)}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            
                            <div className="p-6">
                              <Droppable droppableId={day.id} type="activity">
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="space-y-3 mb-6"
                                  >
                                    {day.activities.length === 0 ? (
                                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                        No activities planned for this day yet.
                                      </p>
                                    ) : (
                                      day.activities.map((activity, activityIndex) => (
                                        <Draggable
                                          key={activity.id}
                                          draggableId={activity.id}
                                          index={activityIndex}
                                        >
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-start gap-3 cursor-move"
                                            >
                                              <div className="flex-shrink-0 w-16 text-center">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                                  {activity.time}
                                                </span>
                                              </div>
                                              
                                              {editActivityId === activity.id ? (
                                                <div className="flex-grow">
                                                  <div className="flex mb-2">
                                                    <input
                                                      type="time"
                                                      value={newActivityTime}
                                                      onChange={(e) => setNewActivityTime(e.target.value)}
                                                      className="w-24 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white mr-2"
                                                    />
                                                    <button
                                                      onClick={() => handleEditActivity(day.id, activity.id, newActivityText, newActivityTime)}
                                                      className="p-1 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400"
                                                    >
                                                      <Save size={16} />
                                                    </button>
                                                  </div>
                                                  <textarea
                                                    value={newActivityText}
                                                    onChange={(e) => setNewActivityText(e.target.value)}
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                                                    rows={2}
                                                  />
                                                </div>
                                              ) : (
                                                <div className="flex-grow">
                                                  <p className="text-gray-800 dark:text-gray-200">
                                                    {activity.description}
                                                  </p>
                                                </div>
                                              )}
                                              
                                              {editActivityId !== activity.id && (
                                                <div className="flex space-x-2">
                                                  <button
                                                    onClick={() => {
                                                      setEditActivityId(activity.id);
                                                      setNewActivityText(activity.description);
                                                      setNewActivityTime(activity.time);
                                                    }}
                                                    className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                                  >
                                                    <Edit2 size={16} />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteActivity(day.id, activity.id)}
                                                    className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                  >
                                                    <Trash2 size={16} />
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </Draggable>
                                      ))
                                    )}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                              
                              <div className="flex items-center space-x-2">
                                <div className="relative flex-shrink-0">
                                  <input
                                    type="time"
                                    value={newActivityTime}
                                    onChange={(e) => setNewActivityTime(e.target.value)}
                                    className="w-24 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={newActivityText}
                                  onChange={(e) => setNewActivityText(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddActivity(day.id)}
                                  placeholder="Add a new activity..."
                                  className="flex-grow border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                  onClick={() => handleAddActivity(day.id)}
                                  className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                  <Plus size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            <p>
              Tip: Drag days or activities to reorder them. Your trip plan is automatically saved in your browser.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;