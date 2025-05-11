import { useState, useEffect } from 'react';
import axios from 'axios';
import StudentModal from '../components/StudentModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [drives, setDrives] = useState([]);
  const studentsPerPage = 6;

  useEffect(() => {
    fetchStudents();
    fetchDrives();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      fetchStudents();
      fetchDrives();
    }
  }, [isModalOpen]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const [studentsRes, vaccinationRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/students/students/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/vaccinations/vaccination-records/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
  
      const students = studentsRes.data;
      const records = vaccinationRes.data;
  
      const enriched = students.map((student) => {
        const studentRecords = records.filter(r => r.student === student.id);
        const latest = studentRecords[studentRecords.length - 1];
  
        return {
          ...student,
          vaccination_count: studentRecords.length,
          vaccination_drive: latest?.drive_name || 'N/A'
        };
      });
  
      setStudents(enriched);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/students/students/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchStudents();
      await fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

 const handleSubmit = async (studentData) => {
  try {
    const token = localStorage.getItem('token');
    const url = currentStudent
      ? `http://127.0.0.1:8000/students/students/${currentStudent.id}/`
      : `http://127.0.0.1:8000/students/students/`;

    const method = currentStudent ? axios.put : axios.post;
    const studentResponse = await method(url, {
      name: studentData.name,
      grade: studentData.grade,
      roll_number: studentData.roll_number,
      vaccination_status: studentData.vaccination_status
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const studentId = currentStudent ? currentStudent.id : studentResponse.data.id;

    if (studentData.vaccination_status && studentData.vaccinated_in) {
      try {
        await axios.post('http://127.0.0.1:8000/vaccinations/vaccination-records/', {
          student: studentId,
          drive: parseInt(studentData.vaccinated_in)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        if (err.response && err.response.status === 400) {
          console.warn("Vaccination record already exists");
        } else {
          throw err;
        }
      }
    }

    setIsModalOpen(false);
    setCurrentStudent(null);
    await fetchStudents();
    await fetchDrives();
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    setError(err.response?.data?.message || 'Failed to save student');
  }
};

  const handleBulkUpload = async (file) => {
    if (!file) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      setUploadError('');
      setUploadSuccess('');

      await axios.post('http://127.0.0.1:8000/students/upload-csv/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadSuccess('Students uploaded successfully!');
      fetchStudents();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload students');
    }
  };

  const filteredStudents = students.filter(student => {
    return (
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade?.toString().includes(searchTerm) ||
      student.roll_number?.toString().includes(searchTerm)
    );
  });

  const studentsByGrade = filteredStudents.reduce((acc, student) => {
    const grade = student.grade;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(student);
    return acc;
  }, {});

  const grades = Object.keys(studentsByGrade).sort((a, b) => a - b);

  const currentStudents = selectedGrade
    ? studentsByGrade[selectedGrade] || []
    : filteredStudents;

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudentsPage = currentStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(currentStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center py-8">Loading students...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Registry</h1>
        <button
          onClick={() => {
            setCurrentStudent(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add Student
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, grade or roll number..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedGrade(null);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {!searchTerm && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Select Grade</h2>
          <div className="flex overflow-x-auto pb-2">
            <div className="flex space-x-2">
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    setSelectedGrade(selectedGrade === grade ? null : grade);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${
                    selectedGrade === grade
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Grade {grade} ({studentsByGrade[grade].length})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccinated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccination Drive</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudentsPage.length > 0 ? (
              currentStudentsPage.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.grade}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.roll_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.vaccination_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.vaccination_status ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {student.vaccination_status ? student.vaccination_drive : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setCurrentStudent(student);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  {selectedGrade 
                    ? `No students found in Grade ${selectedGrade}`
                    : 'No students found matching your search'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {currentStudents.length > studentsPerPage && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 border-t border-b border-gray-300 ${
                  currentPage === number
                    ? 'bg-blue-50 text-blue-600 border-blue-500'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentStudent(null);
          setUploadError('');
          setUploadSuccess('');
        }}
        onSubmit={handleSubmit}
        student={currentStudent}
        onBulkUpload={handleBulkUpload}
        uploadError={uploadError}
        uploadSuccess={uploadSuccess}
      />
    </div>
  );
};

export default Students;
