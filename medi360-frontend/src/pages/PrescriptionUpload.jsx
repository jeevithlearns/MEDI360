import React, { useState, useRef } from 'react';
import { prescriptionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaUpload, FaSpinner, FaCheckCircle, FaFilePrescription } from 'react-icons/fa';

function PrescriptionUpload() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imagePreview) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      const res = await prescriptionAPI.upload({ imageBase64: imagePreview });
      setExtractedData(res.extracted);
      toast.success('Prescription parsed & saved successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to parse prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
        <FaFilePrescription className="text-5xl text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Prescription</h2>
        <p className="text-gray-600 mb-6">Take a photo of your doctor's prescription, and our AI will automatically extract the medicines and set up reminders for you.</p>

        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:bg-gray-50 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
          ) : (
            <div className="space-y-4">
              <FaUpload className="text-4xl text-gray-400 mx-auto" />
              <p className="text-gray-500 font-medium">Click to select an image or PDF</p>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {imagePreview && (
          <div className="mt-6 flex justify-center gap-4">
            <button 
              onClick={() => setImagePreview(null)} 
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
            >
              Clear
            </button>
            <button 
              onClick={handleUpload} 
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 flex items-center"
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />}
              {loading ? 'Processing...' : 'Upload & Parse (AI)'}
            </button>
          </div>
        )}
      </div>

      {extractedData && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Extracted Information</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Doctor</p>
              <p className="font-medium">{extractedData.doctorName || 'Not found'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Diagnosis</p>
              <p className="font-medium">{extractedData.diagnosis || 'Not found'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Issued</p>
              <p className="font-medium">{extractedData.issuedDate || 'Not found'}</p>
            </div>
          </div>

          <h4 className="font-bold text-gray-800 mb-3">Medicines Found</h4>
          <div className="space-y-3">
            {extractedData.medicines?.map((med, idx) => (
              <div key={idx} className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-blue-900">{med.name}</h5>
                  <p className="text-sm text-blue-700">Dosage: {med.dosage}</p>
                  <p className="text-sm text-blue-700">Instructions: {med.instructions}</p>
                </div>
                <div className="text-right">
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                    {med.frequency} x {med.durationDays} days
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-lg text-sm flex items-center font-medium">
             <FaCheckCircle className="mr-2 text-xl" /> Reminders have been automatically created for these medicines!
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionUpload;
