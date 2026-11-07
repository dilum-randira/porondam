import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/validation';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara',
  'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const initialFormData = {
  name: '',
  email: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  interestedIn: '',
  district: '',
  bio: '',
};

function RegisterForm() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStepOne = () => {
    if (!formData.name.trim()) {
      setError('Name is required.');
      return false;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters.');
      return false;
    }

    const birth = new Date(formData.dateOfBirth + 'T00:00:00Z');
    const today = new Date();
    const cutoff = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
    if (!formData.dateOfBirth || !Number.isFinite(birth.getTime()) ||
        birth.toISOString().slice(0, 10) !== formData.dateOfBirth || birth > cutoff) {
      setError('You must be at least 18 years old to register.');
      return false;
    }
    return true;
  };

  const validateStepTwo = () => {
    if (!formData.gender) {
      setError('Please choose your gender.');
      return false;
    }
    if (!formData.interestedIn) {
      setError('Please select who you are interested in.');
      return false;
    }

    return true;
  };

  const goToNextStep = () => {
    setError('');
    if (validateStepOne()) {
      setStep(2);
    }
  };

  const goToPrevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validateStepTwo()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-6 py-8 md:px-10">
        <div className="space-y-2">
          <div className="inline-flex items-baseline gap-1 text-2xl font-semibold tracking-tight text-pulse-primary">
            <span className="tracking-tight">Porondam</span>
            <span className="text-3xl leading-none">.</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
          <p className="text-sm text-gray-500">Create your account to find a meaningful connection.</p>
          <p className="text-xs text-gray-400">Step {step} of 2</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-off-white px-3 py-2.5 text-sm outline-none focus:border-pulse-primary focus:ring-1 focus:ring-pulse-primary"
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-off-white px-3 py-2.5 text-sm outline-none focus:border-pulse-primary focus:ring-1 focus:ring-pulse-primary"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Password
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-off-white px-3 py-2.5 text-sm outline-none focus:border-pulse-primary focus:ring-1 focus:ring-pulse-primary"
                  placeholder="At least 12 characters"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Date of birth (18+ only)
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-pulse-primary focus:ring-2 focus:ring-pulse-primary" />
              </label>
              {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}

              <Button type="button" className="w-full bg-pulse-primary text-white hover:bg-rose-700" onClick={goToNextStep}>
                Continue
              </Button>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Gender
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pulse-primary focus:ring-1 focus:ring-pulse-primary"
                  required
                >
                  <option value="">Select one</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Interested In
                <select
                  name="interestedIn"
                  value={formData.interestedIn}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pulse-primary focus:ring-1 focus:ring-pulse-primary"
                  required
                >
                  <option value="">Select one</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                  <option value="everyone">Everyone</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                District (optional)
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
                >
                  <option value="">Anywhere in Sri Lanka or diaspora</option>
                  {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                </select>
                <span className="mt-1 block text-xs font-normal text-gray-500">Only your district preference is used for discovery. No precise location is requested.</span>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Bio
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-off-white px-3 py-2.5 text-sm outline-none focus:border-pulse-primary focus:ring-1 focus:ring-pulse-primary"
                  placeholder="Tell people a little about yourself"
                />
              </label>

              {error ? <p className="text-xs text-red-500">{error}</p> : null}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={goToPrevStep}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-pulse-primary text-white hover:bg-rose-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="pt-2 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-pulse-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
