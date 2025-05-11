import { useState, useEffect } from 'react';

const DriveModal = ({ isOpen, onClose, onSubmit, drive }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    target_grades: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (drive) {
      setFormData({
        name: drive.name,
        date: drive.date.split('T')[0],
        target_grades: drive.target_grades
      });
    } else {
      setFormData({
        name: '',
        date: '',
        target_grades: ''
      });
    }
    setErrorMessage('');
  }, [drive]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'date') {
      validateDate(e.target.value);
    }
  };

  const validateDate = (selectedDate) => {
    const today = new Date();
    const inputDate = new Date(selectedDate);

    // Remove time portion for accurate comparison
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      setErrorMessage('Date cannot be in the past. Please select today or a future date.');
    } else {
      setErrorMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final check before submitting
    const today = new Date();
    const inputDate = new Date(formData.date);
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      setErrorMessage('Date cannot be in the past. Please select today or a future date.');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {drive ? 'Edit Drive' : 'Add New Drive'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Drive Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Show error message if date is invalid */}
          {errorMessage && (
            <div className="mb-4 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="target_grades" className="block text-sm font-medium text-gray-700">
              Target Grades
            </label>
            <input
              type="text"
              name="target_grades"
              id="target_grades"
              value={formData.target_grades}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 5-10 or 5,6,7"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!errorMessage} // Disable save if error is there
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                errorMessage ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriveModal;