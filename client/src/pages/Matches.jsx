import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Avatar from '../components/ui/Avatar';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [pendingAccountId, setPendingAccountId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await api.get('/matches');
        setMatches(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load your matches.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const newMatches = useMemo(
    () => matches.filter((match) => !match.lastMessage).slice(0, 10),
    [matches]
  );

  const recentConversations = useMemo(
    () => matches.filter((match) => Boolean(match.lastMessage)),
    [matches]
  );

  const blockMatch = async (match) => {
    if (!window.confirm(`Block ${match.user.name}? You will no longer see or message each other.`)) return;
    if (pendingAccountId) return;
    setPendingAccountId(match.user._id);
    try {
      setError('');
      setNotice('');
      await api.put(`/blocks/${match.user._id}`);
      setMatches((previous) => previous.filter((item) => item.user._id !== match.user._id));
      setNotice('Account blocked. You can manage blocked accounts below.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to block this account.');
    } finally {
      setPendingAccountId(null);
    }
  };

  const loadBlocked = async () => {
    setBlockedLoading(true);
    setError('');
    try {
      const response = await api.get('/blocks');
      setBlockedAccounts(Array.isArray(response.data) ? response.data : []);
      setShowBlocked(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load blocked accounts.');
    } finally {
      setBlockedLoading(false);
    }
  };

  const unblockAccount = async (account) => {
    if (!window.confirm(`Unblock ${account.name}? They may appear in discovery again.`)) return;
    if (pendingAccountId) return;
    setPendingAccountId(account.userId);
    try {
      setError('');
      setNotice('');
      await api.delete(`/blocks/${account.userId}`);
      setBlockedAccounts((previous) => previous.filter((item) => item.userId !== account.userId));
      setNotice('Account unblocked. Existing matches are not automatically restored.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to unblock this account.');
    } finally {
      setPendingAccountId(null);
    }
  };

  const openChat = (match) => {
    navigate(`/chat/${match._id}`, { state: { match } });
  };

  if (isLoading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center text-romantic-accent">
        Loading matches...
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-6">
      {notice ? <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div>
        <h1 className="text-2xl font-bold text-romantic-accent">Matches</h1>
        <p className="mt-1 text-sm text-gray-600">See who’s new and continue your conversations.</p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-romantic-accent">Blocked accounts</h2>
            <p className="text-sm text-gray-600">Review accounts you blocked. Unblocking does not restore a match or conversation.</p>
          </div>
          <button type="button" onClick={() => showBlocked ? setShowBlocked(false) : loadBlocked()}
            disabled={blockedLoading} aria-expanded={showBlocked} aria-controls="blocked-accounts"
            className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-800 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            {blockedLoading ? 'Loading...' : showBlocked ? 'Hide blocked accounts' : 'Manage blocked accounts'}
          </button>
        </div>
        {showBlocked && <div id="blocked-accounts" className="mt-4 space-y-2" aria-live="polite">
          {blockedAccounts.length === 0 ? <p className="text-sm text-gray-600">No blocked accounts to display.</p> :
            blockedAccounts.map((account) => <div key={account.userId} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
              <span className="min-w-0 break-words text-sm font-medium text-gray-800">{account.name || 'Account'}</span>
              <button type="button" onClick={() => unblockAccount(account)} disabled={Boolean(pendingAccountId)}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                Unblock
              </button>
            </div>)}
        </div>}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-romantic-primary">New Matches</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {newMatches.length ? (
            newMatches.map((match) => (
              <div key={match._id} className="flex w-24 shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => openChat(match)}
                className="flex w-20 shrink-0 flex-col items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Avatar name={match.user.name} src={match.user.images?.[0]} size="lg" />
                <span className="w-full truncate text-xs font-medium text-gray-700">{match.user.name}</span>
              </button>
              <button type="button" onClick={() => blockMatch(match)} disabled={Boolean(pendingAccountId)} className="rounded-lg px-2 py-1 text-xs text-rose-800 underline underline-offset-2 focus-visible:outline focus-visible:outline-2" aria-label={`Block ${match.user.name}`}>Block</button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No new matches yet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-romantic-primary">Recent Conversations</h2>
        <div className="mt-3 space-y-3">
          {recentConversations.length ? (
            recentConversations.map((match) => (
              <div key={match._id} className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-white p-3 shadow-sm">
                <button type="button" onClick={() => openChat(match)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Avatar name={match.user.name} src={match.user.images?.[0]} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-romantic-accent">{match.user.name}</p>
                  <p className="truncate text-sm text-gray-600">{match.lastMessage}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {match.lastMessageAt
                    ? formatDistanceToNow(new Date(match.lastMessageAt), { addSuffix: true })
                    : ''}
                </span>
                </button>
                <button type="button" onClick={() => blockMatch(match)} disabled={Boolean(pendingAccountId)}
                  aria-label={`Block ${match.user.name}`}
                  className="shrink-0 rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                  Block
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
              <MessageCircle className="mx-auto mb-2 h-6 w-6 text-romantic-primary" />
              Start chatting once you match with someone.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Matches;