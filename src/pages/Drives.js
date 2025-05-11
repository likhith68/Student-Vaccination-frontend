import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DriveModal from '../components/DriveModal';

const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDrive, setCurrentDrive] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const drivesPerPage = 6;

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/drives/drives', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrives(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drives');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drive?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/drives/drives/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete drive');
    }
  };

  const handleSubmit = async (driveData) => {
    try {
      const token = localStorage.getItem('token');
      if (currentDrive) {
        await axios.put(`http://127.0.0.1:8000/drives/drives/${currentDrive.id}/`, driveData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://127.0.0.1:8000/drives/drives/', driveData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setCurrentDrive(null);
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save drive');
    }
  };

  const filteredDrives = drives.filter(drive =>
    drive.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const indexOfLastDrive = currentPage * drivesPerPage;
  const indexOfFirstDrive = indexOfLastDrive - drivesPerPage;
  const currentDrives = filteredDrives.slice(indexOfFirstDrive, indexOfLastDrive);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vaccination Drives</h1>
        <button
          onClick={() => {
            setCurrentDrive(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add Drive
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search drives..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDrives.map((drive) => (
          <div key={drive.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800">{drive.name}</h3>
              <p className="text-gray-500 text-sm mt-2">
                {new Date(drive.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-gray-500 text-sm mt-1">Target Grades: {drive.target_grades}</p>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCurrentDrive(drive);
                  setIsModalOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(drive.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDrives.length > drivesPerPage && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-gray-700">
            Page {currentPage} of {Math.ceil(filteredDrives.length / drivesPerPage)}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDrives.length / drivesPerPage)))}
            disabled={currentPage === Math.ceil(filteredDrives.length / drivesPerPage)}
            className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <DriveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentDrive(null);
        }}
        onSubmit={handleSubmit}
        drive={currentDrive}
      />
    </div>
  );
};

export default Drives;