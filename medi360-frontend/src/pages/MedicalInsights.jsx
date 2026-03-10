import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { prescriptionAPI, reminderAPI, medicineAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaFileMedical, FaClock, FaShieldAlt, FaCapsules, FaSpinner, FaChevronRight } from 'react-icons/fa';

function MedicalInsights() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeMedicines: [],
    recentPrescriptions: [],
    nextReminder: null
  });

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [medsRes, prescRes, remsRes] = await Promise.all([
        medicineAPI.getAll(),
        prescriptionAPI.getAll(),
        reminderAPI.getToday()
      ]);

      const now = new Date();
      
      const activeMeds = medsRes.data?.filter(m => new Date(m.endDate) >= now) || [];
      const recentPresc = prescRes.data?.slice(0, 3) || [];
      const todayReminders = remsRes.data || [];
      
      let nextReminder = null;
      if (todayReminders.length > 0) {
          // Just take the first active one for simplicity in the demo
          nextReminder = todayReminders[0];
      }

      setData({
        activeMedicines: activeMeds,
        recentPrescriptions: recentPresc,
        nextReminder
      });
    } catch (error) {
      toast.error('Failed to load insights data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Medical Management Hub</h2>
          <p className="text-gray-600 mt-2">Manage your prescriptions, track medicines, and check drug safety.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Next Reminder Widget */}
        <Link to="/reminders" className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-sm hover:shadow-lg transition flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <FaClock className="text-4xl opacity-80" />
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">Today</span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold opacity-90">Next Reminder</h3>
            {data.nextReminder ? (
              <p className="text-3xl font-bold mt-1">{data.nextReminder.name}</p>
            ) : (
              <p className="text-xl font-bold mt-1">None Pending</p>
            )}
            <p className="text-sm opacity-80 mt-2 flex items-center">Open Dashboard <FaChevronRight className="ml-1 text-xs" /></p>
          </div>
        </Link>

        {/* Prescription Widget */}
        <Link to="/prescription-upload" className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition border-t-4 border-emerald-500">
          <FaFileMedical className="text-4xl text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Upload Prescription</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">Use AI to automatically extract medicines and create reminders from a photo.</p>
        </Link>

        {/* Prescriptions History */}
        <Link to="/prescriptions" className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition border-t-4 border-indigo-500">
          <FaFileMedical className="text-4xl text-indigo-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">History ({data.recentPrescriptions.length})</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">View all past prescriptions and associated medicines.</p>
        </Link>
        
        {/* Drug Safety Widget */}
        <Link to="/drug-safety" className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition border-t-4 border-orange-500">
          <FaShieldAlt className="text-4xl text-orange-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Safety Checker</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">Check for dangerous interactions between medications before taking them.</p>
        </Link>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center"><FaCapsules className="mr-2 text-blue-500" /> Active Medicines</h3>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">{data.activeMedicines.length}</span>
          </div>
          {data.activeMedicines.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No active medicines found.</p>
          ) : (
             <div className="space-y-4">
               {data.activeMedicines.map(med => (
                 <div key={med._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <div>
                     <p className="font-bold text-gray-900">{med.name}</p>
                     <p className="text-sm text-gray-500">{med.dosage} · {med.frequencyPerDay}x/day</p>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center"><FaFileMedical className="mr-2 text-indigo-500" /> Recent Prescriptions</h3>
          </div>
          {data.recentPrescriptions.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No prescriptions uploaded yet.</p>
          ) : (
             <div className="space-y-4">
               {data.recentPrescriptions.map(presc => (
                 <div key={presc._id} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                   <div>
                     <p className="font-bold text-indigo-900">{presc.doctorName || 'Dr. Unknown'}</p>
                     <p className="text-sm text-indigo-700">{new Date(presc.issuedDate).toLocaleDateString()} · {presc.medicines.length} Medicines</p>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default MedicalInsights;
