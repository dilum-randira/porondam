import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Avatar from '../components/ui/Avatar';

function Matches() {
  const [matches, setMatches] = useState([]);
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
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div>
        <h1 className="text-2xl font-bold text-romantic-accent">Matches</h1>
        <p className="mt-1 text-sm text-gray-600">See who’s new and continue your conversations.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-romantic-primary">New Matches</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {newMatches.length ? (
            newMatches.map((match) => (
              <button
                key={match._id}
                type="button"
                onClick={() => openChat(match)}
                className="flex w-20 shrink-0 flex-col items-center gap-2"
              >
                <Avatar name={match.user.name} src={match.user.images?.[0]} size="lg" />
                <span className="w-full truncate text-xs font-medium text-gray-700">{match.user.name}</span>
              </button>
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
              <button
                key={match._id}
                type="button"
                onClick={() => openChat(match)}
                className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-white p-3 text-left shadow-sm"
              >
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