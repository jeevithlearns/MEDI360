import React, { useState, useEffect } from 'react';
import { reminderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaPills, FaCheck, FaClock, FaSpinner } from 'react-icons/fa';

function MedicineReminderDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await reminderAPI.getToday();
      setMedicines(res.data);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const markTaken = async (medicineId, time) => {
    try {
      await reminderAPI.markTaken(medicineId, time);
      toast.success('Medicine marked as taken!');
      fetchReminders(); // refresh to show updated state
    } catch (error) {
      toast.error('Failed to mark as taken');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Today's Medicines</h2>

      {medicines.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
          <FaPills className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-xl">You have no medicines scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {medicines.map(med => {
            // Check if already taken today
            const todayStr = new Date().toDateString();
            
            return med.times.map(time => {
              const takenLog = med.takenLog.find(log => new Date(log.date).toDateString() === todayStr && log.time === time);
              const isTaken = !!takenLog;

              return (
                <div key={`${med._id}-${time}`} className={`flex items-center justify-between p-6 rounded-xl border shadow-sm transition ${isTaken ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-blue-100 hover:shadow-md'}`}>
                  <div className="flex items-center space-x-6">
                    <div className={`p-4 rounded-full ${isTaken ? 'bg-green-200 text-green-700' : 'bg-blue-100 text-blue-600'}`}>
                      <FaPills className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{med.name}</h3>
                      <p className="text-gray-600 font-medium">{med.dosage}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500 font-semibold">
                        <FaClock className="mr-1" /> Scheduled for {time}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {isTaken ? (
                      <span className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold">
                        <FaCheck className="mr-2" /> Taken
                      </span>
                    ) : (
                      <button 
                        onClick={() => markTaken(med._id, time)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                      >
                        Mark as Taken
                      </button>
                    )}
                  </div>
                </div>
              );
            });
          })}
        </div>
      )}
    </div>
  );
}

export default MedicineReminderDashboard;
