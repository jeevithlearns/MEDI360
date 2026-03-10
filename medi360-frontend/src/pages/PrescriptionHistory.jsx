import React, { useState, useEffect } from 'react';
import { prescriptionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaFileInvoice, FaSpinner, FaEye } from 'react-icons/fa';

function PrescriptionHistory() {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await prescriptionAPI.getAll();
      setPrescriptions(res.data);
    } catch (error) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Prescription History</h2>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
          <FaFileInvoice className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-xl">No prescriptions uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((presc) => (
            <div key={presc._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{presc.doctorName || 'Unknown Doctor'}</h3>
                  <p className="text-sm text-gray-500">{new Date(presc.issuedDate).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedImage(presc.prescriptionImage)}
                  className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  title="View Image"
                >
                  <FaEye />
                </button>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-4">
                <span className="font-semibold">Diagnosis:</span> {presc.diagnosis || 'None listed'}
              </p>
              <h4 className="font-semibold text-gray-800 text-sm mb-2">Medicines ({presc.medicines.length})</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {presc.medicines.map((med, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>• {med.name}</span>
                    <span className="text-gray-400">{med.dosage}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Prescription" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}

export default PrescriptionHistory;
