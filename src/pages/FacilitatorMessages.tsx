import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Inbox, Users, MessageCircle, Send, Star, Paperclip, Search, ChevronRight } from 'lucide-react'

// ── Static data ───────────────────────────────────────────────────────────────
const INBOX = [
    {
        id: 1, sender: 'John Doe', avatar: 'J', subject: 'Course Enrollment Request',
        preview: 'I would like to formally request enrollment in the Advanced Data Structures course…',
        time: '2h ago', unread: true, starred: false,
    },
    {
        id: 2, sender: 'Jane Smith', avatar: 'J', subject: 'Quiz Question – Module 3',
        preview: 'Can you clarify question 4 in the quiz? The wording seems ambiguous to me…',
        time: '5h ago', unread: false, starred: true,
    },
    {
        id: 3, sender: 'Mike Johnson', avatar: 'M', subject: 'Module Completion',
        preview: 'I have completed Module 2 and I am ready to move on. When is the next live session?',
        time: '1d ago', unread: false, starred: false,
    },
    {
        id: 4, sender: 'Aisha Kamau', avatar: 'A', subject: 'Assignment Submission',
        preview: 'Please find my assignment attached. I hope it meets all the requirements you outlined…',
        time: '2d ago', unread: false, starred: false,
    },
    {
        id: 5, sender: 'David Osei', avatar: 'D', subject: 'Feedback Request',
        preview: 'Could you share feedback on my last project? I would love to improve before the deadline.',
        time: '3d ago', unread: false, starred: true,
    },
]

const GROUPS = [
    {
        id: 1, name: 'Web Development Cohort A', members: 12, lastMessage: 'Great session today everyone! Remember to push your code.', time: '1h ago', unread: 3,
    },
    {
        id: 2, name: 'Data Science Study Group', members: 8, lastMessage: 'Can someone share the notebook from last class?', time: '4h ago', unread: 0,
    },
    {
        id: 3, name: 'Mobile App Development', members: 15, lastMessage: 'Next class is moved to Friday at 3 PM.', time: 'Yesterday', unread: 1,
    },
    {
        id: 4, name: 'UX Design Workshop', members: 6, lastMessage: 'Prototypes due by end of week. Good luck!', time: '2d ago', unread: 0,
    },
]

const DISCUSSIONS = [
    {
        id: 1, title: 'Best resources for learning React?', course: 'Web Development', replies: 14, author: 'Jane Smith', time: '3h ago', pinned: true,
    },
    {
        id: 2, title: 'Struggling with async/await — any tips?', course: 'JavaScript Fundamentals', replies: 9, author: 'Mike Johnson', time: '6h ago', pinned: false,
    },
    {
        id: 3, title: 'Project ideas for the final assessment', course: 'Data Science', replies: 22, author: 'Aisha Kamau', time: '1d ago', pinned: false,
    },
    {
        id: 4, title: 'Understanding gradient descent intuitively', course: 'Machine Learning', replies: 7, author: 'David Osei', time: '2d ago', pinned: false,
    },
    {
        id: 5, title: 'Figma tips for beginners', course: 'UX Design', replies: 5, author: 'Lena Müller', time: '3d ago', pinned: false,
    },
]

type Tab = 'inbox' | 'groups' | 'discussions'

export default function FacilitatorMessages() {
    const [tab, setTab] = useState<Tab>('inbox')
    const [search, setSearch] = useState('')
    const [selectedInbox, setSelectedInbox] = useState<number | null>(null)
    const [reply, setReply] = useState('')

    const unreadCount = INBOX.filter(m => m.unread).length
    const openMsg = INBOX.find(m => m.id === selectedInbox)

    const filteredInbox = INBOX.filter(m =>
        m.sender.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase())
    )

    const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
        { id: 'inbox', label: 'Inbox', icon: Inbox, badge: unreadCount },
        { id: 'groups', label: 'Groups', icon: Users },
        { id: 'discussions', label: 'Discussions', icon: MessageCircle },
    ]

    return (
        <DashboardLayout title="Messages">
            <div className="space-y-6">

                {/* Tab Bar */}
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md border border-primary/10 rounded-2xl p-1.5 w-fit">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setTab(t.id); setSelectedInbox(null); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-primary/5'
                                }`}
                        >
                            <t.icon size={16} />
                            {t.label}
                            {t.badge !== undefined && t.badge > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/30 text-white' : 'bg-primary text-white'}`}>
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── INBOX ─────────────────────────────────────────────────────────── */}
                {tab === 'inbox' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Message List */}
                        <div className={`lg:col-span-1 space-y-3 ${selectedInbox ? 'hidden lg:block' : ''}`}>
                            {/* Search */}
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/60 border border-primary/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
                                <div className="divide-y divide-primary/5">
                                    {filteredInbox.map(msg => (
                                        <button
                                            key={msg.id}
                                            onClick={() => setSelectedInbox(msg.id)}
                                            className={`w-full text-left p-4 hover:bg-primary/5 transition-colors ${msg.unread ? 'bg-primary-surface/20' : ''
                                                } ${selectedInbox === msg.id ? 'bg-primary/10' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {msg.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={`text-sm truncate ${msg.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                            {msg.sender}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 flex-shrink-0">{msg.time}</span>
                                                    </div>
                                                    <p className={`text-xs mt-0.5 truncate ${msg.unread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                                                        {msg.subject}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.preview}</p>
                                                </div>
                                                {msg.unread && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Message Detail */}
                        <div className="lg:col-span-2">
                            {openMsg ? (
                                <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden flex flex-col h-full min-h-[480px]">
                                    {/* Header */}
                                    <div className="p-6 border-b border-primary/10 flex items-start gap-4">
                                        <button onClick={() => setSelectedInbox(null)} className="lg:hidden text-primary font-bold text-sm mr-2">← Back</button>
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {openMsg.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-gray-900">{openMsg.sender}</h3>
                                                <span className="text-xs text-gray-400">{openMsg.time}</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700 mt-0.5">{openMsg.subject}</p>
                                        </div>
                                        <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                                            <Star size={18} fill={openMsg.starred ? 'currentColor' : 'none'} className={openMsg.starred ? 'text-yellow-500' : ''} />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 flex-1 text-gray-700 text-sm leading-relaxed">
                                        {openMsg.preview} Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </div>

                                    {/* Reply box */}
                                    <div className="p-4 border-t border-primary/10 flex items-end gap-3">
                                        <textarea
                                            rows={2}
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            placeholder="Write a reply…"
                                            className="flex-1 bg-white/60 border border-primary/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        />
                                        <div className="flex flex-col gap-2">
                                            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                                <Paperclip size={18} />
                                            </button>
                                            <button
                                                onClick={() => setReply('')}
                                                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all flex items-center gap-1.5"
                                            >
                                                <Send size={14} /> Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] h-full min-h-[480px] flex flex-col items-center justify-center text-center p-12">
                                    <Inbox size={48} className="text-gray-200 mb-4" />
                                    <h3 className="font-bold text-gray-500 mb-1">Select a message</h3>
                                    <p className="text-sm text-gray-400">Choose a message from the list to read it here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── GROUPS ───────────────────────────────────────────────────────── */}
                {tab === 'groups' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Your active student groups</p>
                            <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all">
                                + New Group
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {GROUPS.map(g => (
                                <div key={g.id} className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Users size={22} className="text-primary group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold text-gray-900 truncate">{g.name}</h3>
                                                {g.unread > 0 && (
                                                    <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                                        {g.unread}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{g.members} members · {g.time}</p>
                                            <p className="text-sm text-gray-600 mt-2 truncate">{g.lastMessage}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── DISCUSSIONS ───────────────────────────────────────────────────── */}
                {tab === 'discussions' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Student discussions across your courses</p>
                            <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all">
                                + New Thread
                            </button>
                        </div>
                        <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
                            <div className="divide-y divide-primary/5">
                                {DISCUSSIONS.map(d => (
                                    <div key={d.id} className="p-5 hover:bg-primary/5 transition-colors cursor-pointer group flex items-start gap-4">
                                        {d.pinned && (
                                            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0 mt-1">
                                                PINNED
                                            </span>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">{d.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                <span className="bg-primary/5 text-primary font-semibold px-2 py-0.5 rounded-full">{d.course}</span>
                                                <span>by {d.author}</span>
                                                <span>·</span>
                                                <span>{d.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-bold text-gray-500 flex-shrink-0">
                                            <MessageCircle size={14} className="text-primary" />
                                            {d.replies}
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
