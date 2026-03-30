import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, NavLink } from 'react-router-dom';
import { Check, Plus, Trash, ArrowLeft, Loader } from 'lucide-react';
import { checklistCategories } from '../data/checklist';
import { useAuth } from '../context/AuthContext';
import { checklistService } from '../services/checklistService';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistCategory {
  id: string;
  name: string;
  emoji: string;
  items: ChecklistItem[];
}

const ChecklistPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip');

  const [categories, setCategories] = useState<ChecklistCategory[]>(checklistCategories);
  const [loading, setLoading] = useState(true);
  const [saving] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');

  useEffect(() => {
    if (tripId && user) {
      loadChecklist();
    } else {
      const savedChecklist = localStorage.getItem('checklist');
      setCategories(savedChecklist ? JSON.parse(savedChecklist) : checklistCategories);
      setLoading(false);
    }
  }, [tripId, user]);

  const loadChecklist = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      const items = await checklistService.getChecklistItems(tripId);

      if (items.length > 0) {
        const categoriesMap = new Map<string, ChecklistItem[]>();

        items.forEach(item => {
          const category = item.category || 'essentials';
          if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
          }
          categoriesMap.get(category)!.push({
            id: item.id,
            text: item.item_text,
            checked: item.is_packed,
          });
        });

        const loadedCategories = checklistCategories.map(cat => ({
          ...cat,
          items: categoriesMap.get(cat.id) || cat.items.map(item => ({ ...item, checked: false }))
        }));

        setCategories(loadedCategories);
      } else {
        await initializeDefaultChecklist();
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultChecklist = async () => {
    if (!tripId) return;

    try {
      for (const category of checklistCategories) {
        for (const item of category.items) {
          await checklistService.createChecklistItem({
            trip_id: tripId,
            item_text: item.text,
            category: category.id,
            is_packed: false,
            item: '',
            completed: false
          });
        }
      }
      await loadChecklist();
    } catch (error) {
      console.error('Error initializing checklist:', error);
    }
  };

  const toggleItem = async (categoryId: string, itemId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const item = category?.items.find(i => i.id === itemId);

    if (!item) return;

    const newCheckedState = !item.checked;

    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId
                  ? { ...item, checked: newCheckedState }
                  : item
              )
            }
          : category
      )
    );

    if (tripId) {
      try {
        await checklistService.updateChecklistItem(itemId, { is_packed: newCheckedState });
      } catch (error) {
        console.error('Error updating item:', error);
        setCategories(prevCategories =>
          prevCategories.map(category =>
            category.id === categoryId
              ? {
                  ...category,
                  items: category.items.map(item =>
                    item.id === itemId
                      ? { ...item, checked: !newCheckedState }
                      : item
                  )
                }
              : category
          )
        );
      }
    } else {
      localStorage.setItem('checklist', JSON.stringify(categories));
    }
  };

  const addNewItem = async (categoryId: string) => {
    if (newItemText.trim() === '') return;

    const newItem: ChecklistItem = {
      id: tripId ? 'temp-' + Date.now().toString() : Date.now().toString(),
      text: newItemText.trim(),
      checked: false
    };

    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? { ...category, items: [...category.items, newItem] }
          : category
      )
    );

    if (tripId) {
      try {
        const savedItem = await checklistService.createChecklistItem({
          trip_id: tripId,
          item_text: newItemText.trim(),
          category: categoryId,
          is_packed: false,
          item: '',
          completed: false
        });

        setCategories(prevCategories =>
          prevCategories.map(category =>
            category.id === categoryId
              ? {
                  ...category,
                  items: category.items.map(item =>
                    item.id === newItem.id ? { ...item, id: savedItem.id } : item
                  )
                }
              : category
          )
        );
      } catch (error) {
        console.error('Error adding item:', error);
        setCategories(prevCategories =>
          prevCategories.map(category =>
            category.id === categoryId
              ? {
                  ...category,
                  items: category.items.filter(item => item.id !== newItem.id)
                }
              : category
          )
        );
      }
    } else {
      localStorage.setItem('checklist', JSON.stringify(categories));
    }

    setNewItemText('');
  };

  const removeItem = async (categoryId: string, itemId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const itemToRemove = category?.items.find(i => i.id === itemId);

    if (!itemToRemove) return;

    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter(item => item.id !== itemId)
            }
          : category
      )
    );

    if (tripId) {
      try {
        await checklistService.deleteChecklistItem(itemId);
      } catch (error) {
        console.error('Error removing item:', error);
        setCategories(prevCategories =>
          prevCategories.map(category =>
            category.id === categoryId
              ? { ...category, items: [...category.items, itemToRemove] }
              : category
          )
        );
      }
    } else {
      localStorage.setItem('checklist', JSON.stringify(categories));
    }
  };

  const resetChecklist = async () => {
    if (!window.confirm('Are you sure you want to reset your checklist? All checked items will be unchecked.')) {
      return;
    }

    setCategories(prevCategories =>
      prevCategories.map(category => ({
        ...category,
        items: category.items.map(item => ({ ...item, checked: false }))
      }))
    );

    if (tripId) {
      try {
        for (const category of categories) {
          for (const item of category.items) {
            if (item.checked) {
              await checklistService.updateChecklistItem(item.id, { is_packed: false });
            }
          }
        }
      } catch (error) {
        console.error('Error resetting checklist:', error);
      }
    } else {
      localStorage.setItem('checklist', JSON.stringify(categories));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const calculateProgress = () => {
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const checkedItems = categories.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.checked).length,
      0
    );
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {tripId && (
            <NavLink
              to={`/trip/${tripId}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Trip
            </NavLink>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {tripId ? 'Trip Checklist' : 'Packing Checklist'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Get ready for your journey
              </p>
            </div>
            <button
              onClick={resetChecklist}
              className="btn btn-outline btn-sm"
              disabled={saving}
            >
              Reset All
            </button>
          </div>

          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const checkedCount = category.items.filter(item => item.checked).length;
              const totalCount = category.items.length;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.emoji} {category.name} ({checkedCount}/{totalCount})
                </button>
              );
            })}
          </div>

          {categories.map((category) => (
            activeCategory === category.id && (
              <motion.div
                key={category.id}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="card p-6"
              >
                <h2 className="text-2xl font-bold mb-4">
                  {category.emoji} {category.name}
                </h2>

                <div className="space-y-2 mb-4">
                  {category.items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        item.checked
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(category.id, item.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          item.checked
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                        }`}
                      >
                        {item.checked && <Check size={16} className="text-white" />}
                      </button>

                      <span
                        className={`flex-1 ${
                          item.checked
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {item.text}
                      </span>

                      <button
                        onClick={() => removeItem(category.id, item.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewItem(category.id)}
                    placeholder="Add new item..."
                    className="input flex-1"
                  />
                  <button
                    onClick={() => addNewItem(category.id)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              </motion.div>
            )
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ChecklistPage;
