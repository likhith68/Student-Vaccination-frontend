import { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [downloadLoading, setDownloadLoading] = useState({});
  const [showExportMenu, setShowExportMenu] = useState(null);
  const [showAllExportMenu, setShowAllExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 6;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/drives/drives/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (driveId, format) => {
    try {
      setDownloadLoading(prev => ({ ...prev, [driveId]: true }));
      setError('');
      setShowExportMenu(null);
      
      const token = localStorage.getItem('token');
      const endpoint = `http://127.0.0.1:8000/reports/drives/${driveId}/${format}/`;
      
      const response = await axios.get(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        responseType: 'blob'
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `drive_${driveId}_report.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      saveAs(response.data, filename);
      alert(`Report downloaded as ${format.toUpperCase()} successfully`);
    } catch (err) {
      console.error('Download error:', err);
      setError(`Failed to download ${format.toUpperCase()} report. Please try again.`);
      alert(`Failed to download ${format.toUpperCase()} report`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, [driveId]: false }));
    }
  };

  const downloadAllReports = async (format) => {
    try {
      setDownloadLoading(prev => ({ ...prev, 'all': true }));
      setError('');
      setShowAllExportMenu(false);
      
      const token = localStorage.getItem('token');
      const endpoint = `http://127.0.0.1:8000/reports/drives/all/${format}/`;
      
      const response = await axios.get(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        responseType: 'blob'
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `all_drives_report.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      saveAs(response.data, filename);
      alert(`All reports downloaded as ${format.toUpperCase()} successfully`);
    } catch (err) {
      console.error('Download all error:', err);
      setError(`Failed to download all reports as ${format.toUpperCase()}. Please try again.`);
      alert(`Failed to download all reports as ${format.toUpperCase()}`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, 'all': false }));
    }
  };

  const toggleExportMenu = (driveId) => {
    setShowExportMenu(showExportMenu === driveId ? null : driveId);
  };

  const toggleAllExportMenu = () => {
    setShowAllExportMenu(!showAllExportMenu);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesDate = dateFilter ? 
      new Date(report.date).toISOString().split('T')[0] === dateFilter : 
      true;
    return matchesSearch && matchesDate;
  });

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Vaccination Reports</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search by name
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by date
          </label>
          <input
            id="date"
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-end relative">
          <button 
            onClick={toggleAllExportMenu}
            disabled={downloadLoading['all']}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full flex items-center justify-center"
          >
            {downloadLoading['all'] ? 'Exporting...' : 'Export All Reports'}
          </button>
          
          {showAllExportMenu && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-md z-10 border border-gray-200">
              <button 
                onClick={() => downloadAllReports('pdf')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                PDF
              </button>
              <button 
                onClick={() => downloadAllReports('csv')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                CSV
              </button>
              <button 
                onClick={() => downloadAllReports('excel')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md"
              >
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drive Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Grades
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{report.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{report.target_grades || 'All'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                  <button 
                    onClick={() => toggleExportMenu(report.id)}
                    disabled={downloadLoading[report.id]}
                    className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-600 rounded flex items-center"
                  >
                    {downloadLoading[report.id] ? 'Exporting...' : 'Export'}
                  </button>
                  
                  {showExportMenu === report.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md z-10 border border-gray-200">
                      <button 
                        onClick={() => downloadReport(report.id, 'pdf')}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => downloadReport(report.id, 'csv')}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        CSV
                      </button>
                      <button 
                        onClick={() => downloadReport(report.id, 'excel')}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md"
                      >
                        Excel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReports.length > reportsPerPage && (
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
    </div>
  );
};

export default Reports;