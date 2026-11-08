import { useState } from 'react';
import api from '../api/axiosConfig';
import ImageUpload from '../components/profile/ImageUpload';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateUser } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const confirmAdult = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await api.post('/auth/confirm-adult', { dateOfBirth: birthDate, password });
      updateUser({ ...user, adultEligible: true });
      setPassword('');
      setStatus('Your adult eligibility declaration has been recorded.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const primaryImage = user.images?.[0] || null;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-romantic-soft border border-romantic-primary/40">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-romantic-muted text-sm">
              No photo
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-romantic-ink">{user.name}</h1>
          {user.bio && (
            <p className="text-sm text-romantic-muted line-clamp-2 mt-1">{user.bio}</p>
          )}
        </div>
      </div>

      {user.adultEligible === false && (
        <section className="rounded-xl border border-rose-200 bg-white p-5 space-y-3" aria-labelledby="eligibility-title">
          <h2 id="eligibility-title" className="text-lg font-semibold">Confirm adult eligibility</h2>
          <p className="text-sm">To use discovery, confirm that you are at least 18. This is a self-declaration, not identity verification. Your birth date is not shown on your public profile.</p>
          <form onSubmit={confirmAdult} className="space-y-3">
            <label className="block text-sm" htmlFor="birth-date">Date of birth</label>
            <input id="birth-date" className="w-full rounded-lg border p-3" type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <label className="block text-sm" htmlFor="confirm-password">Current password</label>
            <input id="confirm-password" className="w-full rounded-lg border p-3" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="rounded-lg bg-rose-800 px-5 py-3 text-white disabled:opacity-50" disabled={saving} type="submit">{saving ? 'Saving…' : 'Confirm eligibility'}</button>
          </form>
          <p role="status" aria-live="polite" className="text-sm">{status}</p>
        </section>
      )}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-romantic-muted uppercase tracking-wide">
          Photos
        </h2>
        <ImageUpload />
        {user.images && user.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {user.images.map((image, index) => (
              <img
                key={image + index}
                src={image}
                alt={`Profile ${index + 1}`}
                className="h-28 w-full object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;
