import React from 'react'
import Sidebar from '../components/Sidebar'
import { Book, Bookmark, Folder, Search, User, Shield, Bell, HardDrive, PlayCircle, ChevronRight, ArrowLeft, Mail, Download, MoreHorizontal, Paperclip, Send } from 'lucide-react'
import rwandanProgramImg from '../assets/Rwandan program.jpg'
import internationalProgramImg from '../assets/international program.jpg'
import otherSchoolContentsImg from '../assets/other school contents.jpg'
import nurseryStudentsImg from '../assets/nursery students.jpg'
import primaryStudentsImg from '../assets/primary students.jpg'
import secondaryStudentsImg from '../assets/secondary students.jpg'
import universityStudentsImg from '../assets/University students.jpg'

const Layout = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-[#F0F4F8]">
    <Sidebar />
    <main className="flex-1 p-8 overflow-y-auto max-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-gray-600 transition-colors"><Bell size={22} /></button>
                <button className="hover:text-gray-600 transition-colors"><Mail size={22} /></button>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-900 leading-none">Swetha shankaresh</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Student</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="avatar" />
              </div>
            </div>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 min-h-[calc(100vh-10rem)] p-8">
        {children}
      </div>
    </main>
  </div>
)

export const Library = () => (
    <Layout title="Library">
        <div className="relative mb-10 -mt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                placeholder="Search" 
                className="w-full max-w-xl pl-11 pr-4 py-3 bg-[#F8FAFC] border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-gray-200 transition-all font-medium" 
            />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
            {[ 
                { name: 'Chemistry', img: 'https://images.unsplash.com/photo-1532187875605-186c6af84c5c?auto=format&fit=crop&q=80&w=400' },
                { name: 'Chemistry', img: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=400' },
                { name: 'Physics', img: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=400' },
                { name: 'Physics', img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400' },
                { name: 'Math', img: 'https://images.unsplash.com/photo-1509228468518-180dd482195e?auto=format&fit=crop&q=80&w=400' },
                { name: 'Math', img: 'https://images.unsplash.com/photo-1635070040809-953434aa0563?auto=format&fit=crop&q=80&w=400' },
                { name: 'English', img: 'https://images.unsplash.com/photo-1585829365234-754d9c792940?auto=format&fit=crop&q=80&w=400' },
                { name: 'English', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400' }
            ].map((book, i) => (
                <div key={i} className="flex flex-col gap-3 group">
                    <div className="aspect-[3/4] rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-300">
                        <img src={book.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={book.name} />
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-bold text-gray-700">{book.name}</span>
                        <button className="text-[#004D7A] hover:scale-110 transition-transform">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </Layout>
)
export const Programs = () => {
    const [path, setPath] = React.useState<string[]>([]); // Navigation stack

    const mainPrograms = [
        { 
            id: 'rwandan',
            title: 'Rwandan Program', 
            desc: 'National curriculum following the Rwanda Education Board (REB) standards.',
            levels: [
                { id: 'nursery', name: 'Nursery', span: 'Ages 3-6', grades: [], img: nurseryStudentsImg },
                { id: 'primary', name: 'Primary', span: 'P1 - P6', grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], img: primaryStudentsImg },
                { id: 'secondary', name: 'Secondary', span: 'S1 - S6', grades: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], img: secondaryStudentsImg },
                { id: 'university', name: 'University', span: 'Higher Ed', grades: ['Year 1', 'Year 2', 'Year 3', 'Year 4'], img: universityStudentsImg }
            ],
            lessons: 156, 
            img: rwandanProgramImg,
            color: 'from-blue-600 to-blue-400'
        },
        { 
            id: 'international',
            title: 'International Program', 
            desc: 'Global curriculum support including Cambridge, IB, and other international standards.',
            level: 'Primary - High School', 
            lessons: 94, 
            img: internationalProgramImg,
            color: 'from-orange-600 to-orange-400'
        },
        { 
            id: 'other',
            title: 'Other School Contents', 
            desc: 'Supplementary materials, extra-curricular courses, and vocational training.',
            level: 'All Ages', 
            lessons: 48, 
            img: otherSchoolContentsImg,
            color: 'from-purple-600 to-purple-400'
        }
    ];

    const currentProgram = path[0] ? mainPrograms.find(p => p.id === path[0]) : null;
    const currentLevel = path[1] ? currentProgram?.levels?.find(l => l.id === path[1]) : null;

    const navigateBack = () => setPath(prev => prev.slice(0, -1));

    return (
        <Layout title="Programs">
            <div className="mb-8 flex items-center gap-2">
                <button 
                    onClick={() => setPath([])} 
                    className={`text-sm font-bold ${path.length === 0 ? 'text-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Programs
                </button>
                {path.length > 0 && (
                    <>
                        <ChevronRight size={14} className="text-gray-300" />
                        <button 
                            onClick={() => setPath([path[0]])} 
                            className={`text-sm font-bold ${path.length === 1 ? 'text-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {currentProgram?.title}
                        </button>
                    </>
                )}
                {path.length > 1 && (
                    <>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span className="text-sm font-bold text-[#004D7A]">{currentLevel?.name}</span>
                    </>
                )}
            </div>

            {path.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mainPrograms.map(program => (
                        <div key={program.id} className="bg-white rounded-[2.5rem] p-4 border border-gray-100 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                            <div className="h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                                <img src={program.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={program.title} />
                                <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-20`}></div>
                            </div>
                            <div className="px-2 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#004D7A] transition-colors">{program.title}</h3>
                                <p className="text-sm text-gray-500 mb-6">{program.desc}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contents</span>
                                        <span className="text-sm font-bold text-gray-900">{program.lessons}+ Lessons</span>
                                    </div>
                                    <button 
                                        onClick={() => setPath([program.id])}
                                        className="w-12 h-12 bg-[#F0F4F8] rounded-2xl flex items-center justify-center text-[#004D7A] group-hover:bg-[#004D7A] group-hover:text-white transition-all duration-300 shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {path.length === 1 && currentProgram?.levels && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentProgram.levels.map(lvl => (
                        <div 
                            key={lvl.id} 
                            onClick={() => setPath([...path, lvl.id])}
                            className="bg-white rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden"
                        >
                            <div className="h-40 overflow-hidden relative">
                                <img src={(lvl as any).img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={lvl.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#004D7A] group-hover:bg-[#004D7A] group-hover:text-white transition-all">
                                        <Book size={20} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{lvl.span}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#004D7A]">{lvl.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {path.length === 2 && currentLevel?.grades && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {currentLevel.grades.map(grade => (
                        <div 
                            key={grade}
                            className="p-8 bg-white border border-gray-100 rounded-3xl text-center hover:border-[#004D7A] hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer group"
                        >
                            <div className="text-2xl font-black text-gray-300 group-hover:text-[#004D7A] transition-colors mb-2">{grade}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">View Classes</div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export const Messages = () => {
    const [selectedChat, setSelectedChat] = React.useState(0);
    const contacts = [
        { id: 0, name: 'Robin smith', msg: 'Done', time: '1d', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
        { id: 1, name: 'Arun Kumar', msg: 'Nope', time: '1d', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
        { id: 2, name: 'Amit kumar', msg: 'Happy Birthday', time: '1d', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
        { id: 3, name: 'Abishek kumar', msg: 'When is exam?', time: '1d', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100' },
        { id: 4, name: 'Bivesh kumar', msg: 'Hello', time: '2d', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100' },
        { id: 5, name: 'Clara john', msg: 'Chemistry test', time: '2d', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
        { id: 6, name: 'Deepthi manohar', msg: 'I have completed', time: '2d', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
    ];

    return (
        <Layout title="Messages">
            <div className="flex gap-6 h-[calc(100vh-16rem)]">
                {/* Left Panel: Contacts */}
                <div className="w-80 bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                placeholder="Search" 
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/20" 
                            />
                        </div>
                    </div>
                    <div className="flex border-b border-gray-50 text-xs font-bold text-gray-400">
                        <button className="flex-1 py-3 text-[#111827] border-b-2 border-[#111827]">Chat</button>
                        <button className="flex-1 py-3 hover:text-gray-600 transition-colors">Groups</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {contacts.map((contact, i) => (
                            <div 
                                key={contact.id} 
                                onClick={() => setSelectedChat(i)}
                                className={`flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedChat === i ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                            >
                                <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover" alt={contact.name} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{contact.name}</h4>
                                    <p className="text-xs text-gray-400 truncate">{contact.msg}</p>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{contact.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Chat Detail */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={contacts[selectedChat].avatar} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{contacts[selectedChat].name}</h3>
                                <p className="text-[11px] text-gray-400">Online . Last seen 3.00 pm</p>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30">
                        <div className="flex items-start gap-3">
                            <img src={contacts[selectedChat].avatar} className="w-8 h-8 rounded-full border border-gray-100" />
                            <div className="bg-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-none text-sm max-w-md shadow-sm">
                                Hey There?
                            </div>
                        </div>
                        <div className="flex items-start gap-3 justify-end">
                            <div className="bg-[#2D2DAA] text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-md shadow-md">
                                Hello!
                            </div>
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" className="w-8 h-8 rounded-full border border-white" />
                        </div>
                        <div className="flex items-start gap-3">
                            <img src={contacts[selectedChat].avatar} className="w-8 h-8 rounded-full border border-gray-100" />
                            <div className="bg-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-none text-sm max-w-md shadow-sm">
                                I am fine and how are you?
                            </div>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-50 flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-xl">
                            <Paperclip size={20} className="rotate-45" />
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                placeholder="Type a message..." 
                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:border-blue-400 transition-all font-medium pr-12" 
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
export const Settings = () => (
    <Layout title="Settings">
        <div className="max-w-2xl">
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-gray-100">
                <div className="relative">
                    <img className="w-24 h-24 rounded-3xl object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" alt="Profile" />
                    <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-[#004D7A]">
                        <User size={16} />
                    </button>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 text-gray-900">Swetha shankaresh</h2>
                    <p className="text-gray-500 text-sm">Update your photo and personal details.</p>
                </div>
            </div>

            <div className="space-y-6">
                {[
                    { title: 'Personal Information', desc: 'Edit your name, email and phone number', icon: User },
                    { title: 'Security', desc: 'Password and authentication settings', icon: Shield },
                    { title: 'Notifications', desc: 'Manage your alert preferences', icon: Bell }
                ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl cursor-pointer hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl text-gray-400 group-hover:text-[#004D7A] transition-colors shadow-sm">
                                <item.icon size={22} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{item.title}</div>
                                <div className="text-xs text-gray-400">{item.desc}</div>
                            </div>
                        </div>
                        <div className="text-gray-300 group-hover:text-gray-600">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Layout>
)

