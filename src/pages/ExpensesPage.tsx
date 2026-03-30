import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { expenseService, Expense } from '../services/expenseService';
import { Trip } from '../types';
import { PlusCircle, Trash2, CreditCard as Edit2, IndianRupee, TrendingUp, Loader, ArrowLeft } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const EXPENSE_CATEGORIES = [
  'Transport',
  'Accommodation',
  'Food',
  'Activities',
  'Shopping',
  'Medical',
  'Other',
];

const CATEGORY_COLORS: { [key: string]: string } = {
  Transport: '#3b82f6',
  Accommodation: '#8b5cf6',
  Food: '#10b981',
  Activities: '#f59e0b',
  Shopping: '#ec4899',
  Medical: '#ef4444',
  Other: '#6b7280',
};

const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: 'Transport',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTrip) {
      loadExpenses();
    }
  }, [selectedTrip]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getUserTrips(user!.id);
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    if (!selectedTrip) return;
    try {
      const data = await expenseService.getTripExpenses(selectedTrip.id);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        await expenseService.createExpense({
          trip_id: selectedTrip.id,
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }
      await loadExpenses();
      setShowForm(false);
      setEditingExpense(null);
      setFormData({
        category: 'Transport',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to save expense:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await expenseService.deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
    });
    setShowForm(true);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCategoryData = () => {
    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#6b7280',
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="card p-12 text-center">
            <IndianRupee size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Trips Yet</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create a trip to start tracking expenses
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categoryData = getCategoryData();
  const totalExpenses = getTotalExpenses();

  return (
    <div className="section">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Expense Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your travel expenses
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <label className="block text-sm font-medium mb-2">Select Trip</label>
              <select
                value={selectedTrip?.id || ''}
                onChange={(e) => {
                  const trip = trips.find((t) => t.id === e.target.value);
                  setSelectedTrip(trip || null);
                }}
                className="input w-full"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.source} → {trip.destination}
                  </option>
                ))}
              </select>
            </div>

            <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Spent
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400">
                {formatINR(totalExpenses)}
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400">
                {expenses.length}
              </div>
            </div>
          </div>

          {categoryData.length > 0 && (
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Spending by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${formatINR(entry.value)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatINR(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Expense History</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingExpense(null);
                  setFormData({
                    category: 'Transport',
                    description: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                  });
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusCircle size={20} />
                Add Expense
              </button>
            </div>

            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleSubmit}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input w-full"
                      required
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input w-full"
                      placeholder="0"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="submit" className="btn btn-primary">
                    {editingExpense ? 'Update' : 'Add'} Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingExpense(null);
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}

            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No expenses yet. Add your first expense!</p>
              ) : (
                expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[expense.category] || '#6b7280' }}
                        />
                        <span className="font-semibold">{expense.category}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                          {expense.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatINR(expense.amount)}
                      </span>
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExpensesPage;
