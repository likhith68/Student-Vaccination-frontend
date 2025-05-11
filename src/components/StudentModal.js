import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentModal = ({ isOpen, onClose, onSubmit, student, onBulkUpload, uploadError, uploadSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    roll_number: '',
    vaccination_status: false,
    vaccinated_in: null
  });

  const [drives, setDrives] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/drives/drives/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDrives(response.data);
      } catch (error) {
        console.error('Error fetching drives:', error);
      }
    };
    fetchDrives();
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        grade: student.grade || '',
        roll_number: student.roll_number || '',
        vaccination_status: student.vaccination_status || false,
        vaccinated_in: student.vaccinated_in || null
      });
      setActiveTab('single');
    } else {
      resetForm();
    }
  }, [student]);

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      roll_number: '',
      vaccination_status: false,
      vaccinated_in: null
    });
    setCsvFile(null);
    setActiveTab('single');
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.grade) errors.grade = 'Grade is required';
    if (!formData.roll_number) errors.roll_number = 'Roll number is required';
    if (formData.vaccination_status && !formData.vaccinated_in) {
      errors.vaccinated_in = 'Vaccination drive is required when vaccinated';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  onSubmit({
    name: formData.name,
    grade: formData.grade,
    roll_number: formData.roll_number,
    vaccination_status: formData.vaccination_status,
    vaccinated_in: formData.vaccinated_in
  });

  onClose();
};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      setCsvFile(null);
      alert('Please upload a valid CSV file.');
    }
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (csvFile) onBulkUpload(csvFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {student ? 'Edit Student' : 'Add Students'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('single')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Single Entry
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bulk Upload
            </button>
          </nav>
        </div>

        {activeTab === 'single' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                required
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade *</label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                  required
                >
                  <option value="">Select Grade</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
                {formErrors.grade && <p className="mt-1 text-sm text-red-600">{formErrors.grade}</p>}
              </div>
              <div>
                <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700">Roll Number *</label>
                <input
                  type="number"
                  id="roll_number"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                  required
                />
                {formErrors.roll_number && <p className="mt-1 text-sm text-red-600">{formErrors.roll_number}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="vaccination_status"
                name="vaccination_status"
                checked={formData.vaccination_status}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="vaccination_status" className="ml-2 block text-sm text-gray-700">Vaccinated</label>
            </div>

            {formData.vaccination_status && (
              <div>
                <label htmlFor="vaccinated_in" className="block text-sm font-medium text-gray-700">Vaccination Drive *</label>
                <select
                  id="vaccinated_in"
                  name="vaccinated_in"
                  value={formData.vaccinated_in || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                  required
                >
                  <option value="">Select Drive</option>
                  {drives.map(drive => (
                    <option key={drive.id} value={drive.id}>
                      {drive.name} ({new Date(drive.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {formErrors.vaccinated_in && <p className="mt-1 text-sm text-red-600">{formErrors.vaccinated_in}</p>}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="py-2 px-4 border text-sm rounded-md text-gray-700 bg-white">Cancel</button>
              <button type="submit" className="py-2 px-4 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700">Save</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            {uploadError && <div className="bg-red-100 border text-red-700 px-4 py-3 rounded">{uploadError}</div>}
            {uploadSuccess && <div className="bg-green-100 border text-green-700 px-4 py-3 rounded">{uploadSuccess}</div>}
            <div>
              <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">CSV File *</label>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm file:py-2 file:px-4 file:rounded-md file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-sm text-gray-500">Upload a CSV file with student data.</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="py-2 px-4 border text-sm rounded-md text-gray-700 bg-white">Cancel</button>
              <button type="submit" disabled={!csvFile} className="py-2 px-4 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700">Upload</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentModal;
