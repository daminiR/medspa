'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChatWindow } from '@/components/chat';
import { cn } from '@/lib/utils';

// Staff message thread component
function StaffMessageThread() {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      text: 'Your appointment is confirmed for December 15th at 2:00 PM',
      sender: 'staff',
      time: '2h ago'
    },
    {
      id: 2,
      text: 'Thank you! Can I arrive a few minutes early?',
      sender: 'user',
      time: '2h ago'
    },
    {
      id: 3,
      text: 'Of course! Please arrive 10 minutes early for check-in.',
      sender: 'staff',
      time: '1h ago'
    }
  ];

  const handleSend = () => {
    if (message.trim()) {
      // In a real app, this would send the message
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Medical Spa Team</h1>
          <p className="text-sm text-gray-600">Usually responds within a few hours</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4 h-96 overflow-y-auto mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-sm rounded-lg px-4 py-3',
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      msg.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                    )}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AI Assistant chat component
function AIAssistantChat() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">AI Assistant</h1>
          <p className="text-sm text-gray-500">Powered by AI</p>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow className="h-full" />
      </div>
    </div>
  );
}

export default function MessageThreadPage() {
  const params = useParams();
  const id = params.id as string;

  // Check if this is the AI assistant chat
  if (id === 'ai-assistant' || id === '2') {
    return <AIAssistantChat />;
  }

  // Otherwise render staff message thread
  return <StaffMessageThread />;
}
