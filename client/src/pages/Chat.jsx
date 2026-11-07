import { format } from 'date-fns';
import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { connectSocket, getSocket } from '../api/socket';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';

function Chat() {
  const { matchId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [matchInfo, setMatchInfo] = useState(state?.match || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [messageResponse, matchesResponse] = await Promise.all([
          api.get(`/messages/${matchId}`),
          state?.match ? Promise.resolve({ data: [state.match] }) : api.get('/matches'),
        ]);

        setMessages(messageResponse.data || []);

        if (!state?.match) {
          const foundMatch = (matchesResponse.data || []).find((item) => item._id === matchId);
          setMatchInfo(foundMatch || null);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load this chat.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [matchId, state?.match]);

  useEffect(() => {
    if (!token || !matchId || !user?._id) {
      return undefined;
    }

    const socket = connectSocket(token);
    socket?.emit('setup', { _id: user._id });
    socket?.emit('join chat', matchId);

    const onMessageReceived = (incomingMessage) => {
      if (String(incomingMessage.matchId) !== String(matchId)) {
        return;
      }
      setMessages((prev) => [...prev, incomingMessage]);
    };

    socket?.on('message received', onMessageReceived);

    return () => {
      const activeSocket = getSocket();
      activeSocket?.off('message received', onMessageReceived);
    };
  }, [token, matchId, user]);

  const sendMessage = () => {
    const content = newMessage.trim();
    if (!content) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      setError('Chat connection is unavailable.');
      return;
    }

    socket.emit('new message', { matchId, content });
    setNewMessage('');
  };

  const title = useMemo(() => matchInfo?.user?.name || 'Conversation', [matchInfo]);
  const avatar = matchInfo?.user?.images?.[0] || null;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col rounded-3xl border border-rose-100 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-rose-100 px-4 py-3">
        <button type="button" onClick={() => navigate('/matches')} className="text-gray-600" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={title} src={avatar} size="sm" />
        <p className="font-semibold text-romantic-accent">{title}</p>
      </header>

      {error ? <p role="alert" className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading messages...</p>
        ) : messages.length ? (
          messages.map((message) => {
            const mine = String(message.sender) === String(user?._id);

            return (
              <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? 'bg-romantic-primary text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`mt-1 text-[11px] ${mine ? 'text-rose-100' : 'text-gray-500'}`}>
                    {format(new Date(message.createdAt), 'hh:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">No messages yet. Start a conversation when you feel ready.</p>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-rose-100 bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
              }
            }}
            type="text"
            placeholder="Write a respectful message"
            maxLength={2000}
            aria-label="Your message"
            className="w-full rounded-full border border-rose-200 px-4 py-2 text-sm outline-none focus:border-romantic-primary"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-romantic-primary text-white"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Chat;