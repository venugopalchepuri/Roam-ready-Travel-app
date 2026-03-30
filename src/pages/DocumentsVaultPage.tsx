import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Upload, Calendar, AlertCircle, Plus, Trash2 } from 'lucide-react';
import * as documentService from '../services/documentVaultService';
import { TravelDocument } from '../types';

export default function DocumentsVaultPage() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expiringDocuments, setExpiringDocuments] = useState<TravelDocument[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    document_type: 'passport' as TravelDocument['document_type'],
    title: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    issuing_country: ''
  });

  useEffect(() => {
    loadDocuments();
    loadExpiringDocuments();
  }, [tripId]);

  const loadDocuments = async () => {
    try {
      const data = await documentService.getDocuments(tripId || undefined);
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpiringDocuments = async () => {
    try {
      const data = await documentService.getExpiringDocuments(90);
      setExpiringDocuments(data);
    } catch (error) {
      console.error('Error loading expiring documents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await documentService.addDocument({
        ...formData,
        trip_id: tripId || undefined
      });
      setShowAddForm(false);
      setFormData({
        document_type: 'passport',
        title: '',
        document_number: '',
        issue_date: '',
        expiry_date: '',
        issuing_country: ''
      });
      loadDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.deleteDocument(id);
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const documentTypes = [
    { value: 'passport', label: 'Passport', icon: FileText },
    { value: 'visa', label: 'Visa', icon: FileText },
    { value: 'ticket', label: 'Ticket', icon: FileText },
    { value: 'insurance', label: 'Insurance', icon: FileText },
    { value: 'vaccination', label: 'Vaccination', icon: FileText },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Vault</h1>
            <p className="mt-2 text-gray-600">Securely store and manage your travel documents</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>

        {expiringDocuments.length > 0 && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">Documents Expiring Soon</h3>
                <p className="text-sm text-amber-700 mt-1">
                  You have {expiringDocuments.length} document(s) expiring in the next 90 days
                </p>
              </div>
            </div>
          </Card>
        )}

        {showAddForm && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Document</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value as TravelDocument['document_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., My Passport"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Document number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Country
                  </label>
                  <input
                    type="text"
                    value={formData.issuing_country}
                    onChange={(e) => setFormData({ ...formData, issuing_country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Document</Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {documents.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your travel documents</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Document
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const DocIcon = documentTypes.find(t => t.value === doc.document_type)?.icon || FileText;
              const expiringSoon = isExpiringSoon(doc.expiry_date);

              return (
                <Card key={doc.id} className={expiringSoon ? 'border-amber-300' : ''}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DocIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500 capitalize">{doc.document_type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    {doc.document_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number:</span>
                        <span className="font-medium">{doc.document_number}</span>
                      </div>
                    )}
                    {doc.issuing_country && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{doc.issuing_country}</span>
                      </div>
                    )}
                    {doc.expiry_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Expires:</span>
                        <div className="flex items-center gap-1">
                          {expiringSoon && <AlertCircle className="w-4 h-4 text-amber-600" />}
                          <span className={`font-medium ${expiringSoon ? 'text-amber-600' : ''}`}>
                            {new Date(doc.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
