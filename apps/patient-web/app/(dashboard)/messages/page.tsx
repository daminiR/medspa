'use client';

import { useState, useEffect, useRef } from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import {
  MessageSquare,
  Send,
  Plus,
  ArrowLeft,
  Search,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Check,
  CheckCheck,
  Loader2,
  User,
} from 'lucide-react';
import { messagesApi, type Conversation, type Message } from '@/lib/api';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messagesApi.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        // Mock data
        setConversations([
          {
            id: 'c1',
            subject: 'Post-treatment care',
            lastMessage: 'Apply ice as needed and avoid direct sunlight',
            lastMessageAt: new Date().toISOString(),
            unreadCount: 2,
            participants: [{ name: 'Dr. Sarah Smith', role: 'Provider' }],
          },
          {
            id: 'c2',
            subject: 'Appointment follow-up',
            lastMessage: 'Thank you for visiting us today!',
            lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            unreadCount: 0,
            participants: [{ name: 'Front Desk', role: 'Staff' }],
          },
          {
            id: 'c3',
            subject: 'Product recommendation',
            lastMessage: 'I recommend using a gentle cleanser...',
            lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            unreadCount: 0,
            participants: [{ name: 'Jenny Chen', role: 'Esthetician' }],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await messagesApi.getMessages(selectedConversation.id);
        setMessages(data);
        await messagesApi.markAsRead(selectedConversation.id);
        setConversations((prev) =>
          prev.map((c) => c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c)
        );
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        // Mock data
        setMessages([
          { id: 'm1', content: 'Hi! I have some questions about aftercare for my Botox treatment.', sender: 'patient', senderName: 'You', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: true },
          { id: 'm2', content: 'Of course! I am happy to help. What questions do you have?', sender: 'staff', senderName: 'Dr. Sarah Smith', createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), read: true },
          { id: 'm3', content: 'Is it normal to have slight redness? And when can I exercise again?', sender: 'patient', senderName: 'You', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: true },
          { id: 'm4', content: 'Yes, slight redness is completely normal and should subside within a few hours. As for exercise, I recommend waiting 24-48 hours before any strenuous activity.', sender: 'staff', senderName: 'Dr. Sarah Smith', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: true },
          { id: 'm5', content: 'Apply ice as needed and avoid direct sunlight for the first 24 hours as well.', sender: 'staff', senderName: 'Dr. Sarah Smith', createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), read: false },
        ]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const sentMessage = await messagesApi.sendMessage(selectedConversation.id, messageContent);
      setMessages((prev) => [...prev, sentMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add optimistically
      setMessages((prev) => [...prev, {
        id: 'temp-' + Date.now(),
        content: messageContent,
        sender: 'patient',
        senderName: 'You',
        createdAt: new Date().toISOString(),
        read: false,
      }]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartConversation = async () => {
    if (!newSubject.trim() || !newContent.trim()) return;

    setIsSending(true);
    try {
      const conversation = await messagesApi.startConversation(newSubject, newContent);
      setConversations((prev) => [conversation, ...prev]);
      setSelectedConversation(conversation);
      setShowNewConversation(false);
      setNewSubject('');
      setNewContent('');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      // Mock success
      const mockConversation: Conversation = {
        id: 'new-' + Date.now(),
        subject: newSubject,
        lastMessage: newContent,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        participants: [{ name: 'Care Team', role: 'Staff' }],
      };
      setConversations((prev) => [mockConversation, ...prev]);
      setSelectedConversation(mockConversation);
      setShowNewConversation(false);
      setNewSubject('');
      setNewContent('');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Securely message your care team</p>
        </div>
        <button
          onClick={() => setShowNewConversation(true)}
          className="btn-primary btn-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Message
        </button>
      </div>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={'w-full md:w-80 border-r border-gray-200 flex flex-col ' + (selectedConversation ? 'hidden md:flex' : '')}>
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No messages yet</p>
                  <p className="text-sm text-gray-500">Start a conversation with your care team</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={'w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ' + (selectedConversation?.id === conversation.id ? 'bg-primary-50' : '')}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {conversation.participants[0]?.name}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatMessageDate(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium truncate">
                          {conversation.subject}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className={'flex-1 flex flex-col ' + (!selectedConversation ? 'hidden md:flex' : '')}>
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden mr-3 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {selectedConversation.participants[0]?.name}
                    </p>
                    <p className="text-sm text-gray-500">{selectedConversation.subject}</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading messages...</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={'flex ' + (message.sender === 'patient' ? 'justify-end' : 'justify-start')}
                        >
                          <div className={'max-w-[70%] ' + (message.sender === 'patient' ? 'order-2' : '')}>
                            {message.sender === 'staff' && (
                              <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                            )}
                            <div className={'rounded-2xl px-4 py-2 ' + (message.sender === 'patient' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm')}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <div className={'flex items-center mt-1 text-xs ' + (message.sender === 'patient' ? 'justify-end' : '')}>
                              <span className="text-gray-400">
                                {format(parseISO(message.createdAt), 'h:mm a')}
                              </span>
                              {message.sender === 'patient' && (
                                <span className="ml-1 text-primary-400">
                                  {message.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end space-x-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Select a conversation</p>
                  <p className="text-sm text-gray-500">or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowNewConversation(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Message</h3>

              <div className="space-y-4">
                <div>
                  <label className="label mb-1 block">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="What is this about?"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label mb-1 block">Message</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Type your message..."
                    className="input min-h-[120px]"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="btn-secondary btn-md flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartConversation}
                  disabled={!newSubject.trim() || !newContent.trim() || isSending}
                  className="btn-primary btn-md flex-1"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
