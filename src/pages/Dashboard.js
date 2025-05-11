import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_students: 0,
    students_vaccinated: 0,
    vaccinated_by_grade: {},
    vaccination_trend: {},
    upcoming_drives_list: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const location = useLocation();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username') || '';
      setUsername(storedUsername);
      
     
      const [metricsResponse, drivesResponse] = await Promise.all([
        axios.get('http://127.0.0.1:8000/reports/dashboard/metrics/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/drives/drives/?upcoming=true', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMetrics({
        ...metricsResponse.data,
        upcoming_drives_list: drivesResponse.data
      });
      
      renderChart(metricsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location.key]); 

  const renderChart = (data) => {
    const ctx = document.getElementById('vaccinationChart');
    if (!ctx) return;

    if (ctx.chart) {
      ctx.chart.destroy();
    }

    const grades = Object.keys(data.vaccination_trend || {});
    const vaccinated = grades.map(grade => data.vaccination_trend[grade].vaccinated);
    const notVaccinated = grades.map(grade => data.vaccination_trend[grade].not_vaccinated);

    ctx.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: grades.map(grade => `Grade ${grade}`),
        datasets: [
          {
            label: 'Vaccinated',
            data: vaccinated,
            backgroundColor: '#3B82F6',
            borderRadius: 4,
          },
          {
            label: 'Not Vaccinated',
            data: notVaccinated,
            backgroundColor: '#E5E7EB',
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const dataset = context.dataset;
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((context.raw / total) * 100);
                return `Percentage: ${percentage}%`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        }
      }
    });
  };

  const handleRefresh = () => {
    fetchDashboardData();
    
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-500 mb-4">{error}</div>
      <button
        onClick={handleRefresh}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Retry
      </button>
    </div>
  );

  const vaccinationPercentage = metrics.total_students > 0 
    ? Math.round((metrics.students_vaccinated / metrics.total_students) * 100)
    : 0;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome{username ? `, ${username}` : ''}!
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          disabled={loading}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-[1.02]">
          <h3 className="text-gray-500 text-sm font-medium">Vaccination Percentage</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{vaccinationPercentage}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {metrics.students_vaccinated} out of {metrics.total_students} students
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-[1.02]">
          <h3 className="text-gray-500 text-sm font-medium">Students Vaccinated</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.students_vaccinated}</p>
          <p className="text-xs text-gray-400 mt-1">
            {metrics.total_students - metrics.students_vaccinated} remaining
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-[1.02]">
          <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.total_students}</p>
          <p className="text-xs text-gray-400 mt-1">
            Across all grades
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-[1.02]">
          <h3 className="text-gray-500 text-sm font-medium">Upcoming Drives</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.upcoming_drives_list.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            Scheduled vaccinations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vaccination Trend */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Vaccination Trend</h2>
            <div className="flex gap-2">
              <span className="flex items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-1"></span>
                <span className="text-xs">Vaccinated</span>
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-gray-200 rounded-full mr-1"></span>
                <span className="text-xs">Not Vaccinated</span>
              </span>
            </div>
          </div>
          <div className="h-80 w-full">
            <canvas id="vaccinationChart"></canvas>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vaccinations by Class</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {Object.entries(metrics.vaccination_trend || {}).map(([grade, data]) => {
              const totalStudents = data.vaccinated + data.not_vaccinated;
              const percentage = totalStudents > 0 ? Math.round((data.vaccinated / totalStudents) * 100) : 0;
              
              return (
                <div key={grade} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-700 font-medium">Grade {grade}</h3>
                    <p className="text-sm font-semibold">
                      <span className="text-blue-600">{data.vaccinated}</span>
                      <span className="text-gray-400"> / {totalStudents}</span>
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {percentage}% vaccinated
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Vaccination Drives</h2>
            <span className="text-sm text-gray-500">
              Next 30 days
            </span>
          </div>
          {metrics.upcoming_drives_list.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {metrics.upcoming_drives_list.map((drive, index) => (
                <div key={index} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{drive.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(drive.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {Math.ceil((new Date(drive.date) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-2 text-gray-500">No upcoming vaccination drives</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;