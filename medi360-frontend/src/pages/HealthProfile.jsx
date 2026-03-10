/**
 * Health Profile Page
 * User health information management
 */

import React, { useState, useEffect } from 'react';
import { healthProfileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaUser, FaHeartbeat, FaPills, FaAllergies, FaSpinner, FaSave } from 'react-icons/fa';

function HealthProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    bloodGroup: '',
    height: { value: '', unit: 'cm' },
    weight: { value: '', unit: 'kg' },
    lifestyle: {
      smokingStatus: 'never',
      alcoholConsumption: 'never',
      exerciseFrequency: 'sedentary',
      dietType: 'vegetarian',
      sleepHours: '',
      stressLevel: 'moderate'
    }
  });

  const [newCondition, setNewCondition] = useState({ name: '', severity: 'moderate', notes: '' });
  const [newAllergy, setNewAllergy] = useState({ allergen: '', reaction: '', severity: 'moderate' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await healthProfileAPI.get();
      
      if (response.success) {
        setFormData(response.data.profile);
        setHasProfile(true);
      }
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
        setHasProfile(false);
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let response;
      if (hasProfile) {
        response = await healthProfileAPI.update(formData);
      } else {
        response = await healthProfileAPI.create(formData);
      }

      if (response.success) {
        toast.success(hasProfile ? 'Profile updated!' : 'Profile created!');
        setHasProfile(true);
        if (response.data.profile) {
          setFormData(response.data.profile);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addCondition = async () => {
    if (!newCondition.name) {
      toast.error('Please enter condition name');
      return;
    }

    try {
      const response = await healthProfileAPI.addCondition(newCondition);
      if (response.success) {
        toast.success('Condition added');
        setNewCondition({ name: '', severity: 'moderate', notes: '' });
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to add condition');
    }
  };

  const addAllergy = async () => {
    if (!newAllergy.allergen) {
      toast.error('Please enter allergen name');
      return;
    }

    try {
      const response = await healthProfileAPI.addAllergy(newAllergy);
      if (response.success) {
        toast.success('Allergy added');
        setNewAllergy({ allergen: '', reaction: '', severity: 'moderate' });
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to add allergy');
    }
  };

  const addMedication = async () => {
    if (!newMedication.name) {
      toast.error('Please enter medication name');
      return;
    }

    try {
      const response = await healthProfileAPI.addMedication(newMedication);
      if (response.success) {
        toast.success('Medication added');
        setNewMedication({ name: '', dosage: '', frequency: '' });
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to add medication');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-5xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Health Profile</h1>
        <p className="text-gray-600 mt-2">
          {hasProfile ? 'Update your health information' : 'Complete your profile for personalized care'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h3 className="card-header flex items-center">
            <FaUser className="mr-2" />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="input"
                required
                min="0"
                max="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="input"
              >
                <option value="unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height.value"
                value={formData.height.value}
                onChange={handleChange}
                className="input"
                placeholder="175"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight.value"
                value={formData.weight.value}
                onChange={handleChange}
                className="input"
                placeholder="70"
              />
            </div>

            {formData.height.value && formData.weight.value && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BMI (Calculated)
                </label>
                <input
                  type="text"
                  value={((formData.weight.value / ((formData.height.value / 100) ** 2)).toFixed(2))}
                  className="input bg-gray-50"
                  disabled
                />
              </div>
            )}
          </div>
        </div>

        {/* Lifestyle */}
        <div className="card">
          <h3 className="card-header flex items-center">
            <FaHeartbeat className="mr-2" />
            Lifestyle Factors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Smoking Status
              </label>
              <select
                name="lifestyle.smokingStatus"
                value={formData.lifestyle.smokingStatus}
                onChange={handleChange}
                className="input"
              >
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alcohol Consumption
              </label>
              <select
                name="lifestyle.alcoholConsumption"
                value={formData.lifestyle.alcoholConsumption}
                onChange={handleChange}
                className="input"
              >
                <option value="never">Never</option>
                <option value="occasional">Occasional</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Frequency
              </label>
              <select
                name="lifestyle.exerciseFrequency"
                value={formData.lifestyle.exerciseFrequency}
                onChange={handleChange}
                className="input"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light (1-2 days/week)</option>
                <option value="moderate">Moderate (3-4 days/week)</option>
                <option value="active">Active (5-6 days/week)</option>
                <option value="very-active">Very Active (daily)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diet Type
              </label>
              <select
                name="lifestyle.dietType"
                value={formData.lifestyle.dietType}
                onChange={handleChange}
                className="input"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Hours (per night)
              </label>
              <input
                type="number"
                name="lifestyle.sleepHours"
                value={formData.lifestyle.sleepHours}
                onChange={handleChange}
                className="input"
                min="0"
                max="24"
                placeholder="7"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stress Level
              </label>
              <select
                name="lifestyle.stressLevel"
                value={formData.lifestyle.stressLevel}
                onChange={handleChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>{hasProfile ? 'Update Profile' : 'Create Profile'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Medical Conditions */}
      {hasProfile && (
        <>
          <div className="card mt-6">
            <h3 className="card-header flex items-center">
              <FaHeartbeat className="mr-2 text-red-600" />
              Medical Conditions
            </h3>

            {formData.knownConditions && formData.knownConditions.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.knownConditions.map((condition, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{condition.name}</h4>
                        <p className="text-sm text-gray-600">{condition.notes}</p>
                      </div>
                      <span className={`badge badge-${condition.severity}`}>
                        {condition.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Condition name"
                value={newCondition.name}
                onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                className="input"
              />
              <select
                value={newCondition.severity}
                onChange={(e) => setNewCondition({ ...newCondition, severity: e.target.value })}
                className="input"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
              <button type="button" onClick={addCondition} className="btn btn-secondary">
                Add Condition
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div className="card mt-6">
            <h3 className="card-header flex items-center">
              <FaAllergies className="mr-2 text-yellow-600" />
              Allergies
            </h3>

            {formData.allergies && formData.allergies.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{allergy.allergen}</h4>
                        <p className="text-sm text-gray-600">{allergy.reaction}</p>
                      </div>
                      <span className={`badge badge-${allergy.severity === 'life-threatening' ? 'emergency' : allergy.severity}`}>
                        {allergy.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Allergen"
                value={newAllergy.allergen}
                onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Reaction"
                value={newAllergy.reaction}
                onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                className="input"
              />
              <button type="button" onClick={addAllergy} className="btn btn-secondary">
                Add Allergy
              </button>
            </div>
          </div>

          {/* Current Medications */}
          <div className="card mt-6">
            <h3 className="card-header flex items-center">
              <FaPills className="mr-2 text-blue-600" />
              Current Medications
            </h3>

            {formData.currentMedications && formData.currentMedications.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.currentMedications.map((med, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded">
                    <h4 className="font-medium">{med.name}</h4>
                    <p className="text-sm text-gray-600">
                      {med.dosage} - {med.frequency}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Medication name"
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Dosage (e.g., 500mg)"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Frequency (e.g., Twice daily)"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                className="input"
              />
              <button type="button" onClick={addMedication} className="btn btn-secondary">
                Add Medication
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HealthProfile;
