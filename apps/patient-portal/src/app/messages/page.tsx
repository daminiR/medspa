'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Bot, ChevronRight, Sparkles } from 'lucide-react';

export default function MessagesPage() {
  const conversations = [
    {
      id: 1,
      name: 'Medical Spa Team',
      lastMessage: 'Your appointment is confirmed',
      time: '2h ago',
      unread: 2,
      isAI: false
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      lastMessage: 'How can I help you today?',
      time: 'Always available',
      unread: 0,
      isAI: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      {/* AI Assistant Hero Card */}
      <Link href="/messages/ai-assistant">
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 border-0 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-lg">AI Assistant</h3>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                <p className="text-white/90 text-sm mt-1">
                  Get instant answers about treatments, book appointments, and more
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/80">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Available 24/7
                  </span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Book Now', href: '/messages/ai-assistant?action=book' },
            { label: 'Get Pricing', href: '/messages/ai-assistant?action=pricing' },
            { label: 'Hours', href: '/messages/ai-assistant?action=hours' },
            { label: 'Treatments', href: '/messages/ai-assistant?action=treatments' }
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-center hover:bg-gray-100 transition-colors">
                {action.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Conversations
        </h2>
        <div className="space-y-3">
          {conversations.filter(c => !c.isAI).map((conv) => (
            <Link key={conv.id} href={`/messages/${conv.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {conv.unread}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
