import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DashboardLayout from '../components/DashboardLayout'
import { Book, Bookmark, Folder, Search, User, Shield, Bell, HardDrive, PlayCircle, ChevronRight, ArrowLeft, Mail, Download, MoreHorizontal, Paperclip, Send, Menu, MessageSquare, Trash2, CheckSquare } from 'lucide-react'
import { useAuth } from '../auth'
import rwandanProgramImg from '../assets/Rwandan program.jpg'
import internationalProgramImg from '../assets/international program.jpg'
import otherSchoolContentsImg from '../assets/other school contents.jpg'
import nurseryStudentsImg from '../assets/nursery students.jpg'
import primaryStudentsImg from '../assets/primary students.jpg'
import secondaryStudentsImg from '../assets/secondary students.jpg'
import universityStudentsImg from '../assets/University students.jpg'

const Layout = DashboardLayout;

export const Library = () => (
    <Layout title="Library">
        <div className="relative mb-8 md:mb-10 -mt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                placeholder="Search" 
                className="w-full max-w-xl pl-11 pr-4 py-2.5 md:py-3 bg-[#F8FAFC] border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-gray-200 transition-all font-medium" 
            />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-10">
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
                    <div className="aspect-[3/4] rounded-2xl md:rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-300">
                        <img src={book.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={book.name} />
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs md:text-sm font-bold text-gray-700 truncate mr-2">{book.name}</span>
                        <button className="text-[#004D7A] hover:scale-110 transition-transform flex-shrink-0">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </Layout>
)
export const Programs = () => {
    const location = useLocation();
    const [path, setPath] = React.useState<string[]>([]); // Navigation stack

    // Handle initial redirection from Dashboard
    React.useEffect(() => {
        const state = location.state as { initialPath?: string[] };
        if (state?.initialPath) {
            setPath(state.initialPath);
        }
    }, [location.state]);

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

    const [profile, setProfile] = React.useState(() => {
        const saved = localStorage.getItem('soma_profile');
        return saved ? JSON.parse(saved) : { name: 'Swetha shankaresh', avatar: '', grade: '' };
    });

    const currentProgram = path[0] ? mainPrograms.find(p => p.id === path[0]) : null;
    const currentLevel = path[1] ? currentProgram?.levels?.find(l => l.id === path[1]) : null;
    const currentGrade = path[2] || null;
    const isEnrolledInCurrentGrade = profile.grade === currentGrade;

    const handleEnroll = () => {
        if (!currentGrade) return;
        if (profile.grade && profile.grade !== currentGrade) {
            alert(`You are currently enrolled in ${profile.grade}. You must complete it before enrolling in a new grade.`);
            return;
        }
        const newProfile = { ...profile, grade: currentGrade };
        setProfile(newProfile);
        localStorage.setItem('soma_profile', JSON.stringify(newProfile));
        // Trigger storage event for Dashboard
        window.dispatchEvent(new Event('storage'));
        alert(`Successfully enrolled in ${currentGrade}!`);
    };

    const mockCourses = [
        { id: 1, name: 'Mathematics', teacher: 'Emma Kent', img: 'https://images.unsplash.com/photo-1509228468518-180dd482195e?auto=format&fit=crop&q=80&w=400' },
        { id: 2, name: 'Biology', teacher: 'Gren Harry', img: 'https://images.unsplash.com/photo-1532187875605-186c6af84c5c?auto=format&fit=crop&q=80&w=400' },
        { id: 3, name: 'Physics', teacher: 'Sarah Lex', img: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=400' },
        { id: 4, name: 'Chemistry', teacher: 'Hella Anna', img: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=400' },
    ];

    return (
        <Layout title="Programs">
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <button 
                        onClick={() => setPath([])} 
                        className={`text-sm font-bold whitespace-nowrap ${path.length === 0 ? 'text-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Programs
                    </button>
                    {path.length > 0 && (
                        <>
                            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                            <button 
                                onClick={() => setPath([path[0]])} 
                                className={`text-sm font-bold whitespace-nowrap ${path.length === 1 ? 'text-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {currentProgram?.title}
                            </button>
                        </>
                    )}
                    {path.length > 1 && (
                        <>
                            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                            <button 
                                onClick={() => setPath([path[0], path[1]])} 
                                className={`text-sm font-bold whitespace-nowrap ${path.length === 2 ? 'text-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {currentLevel?.name}
                            </button>
                        </>
                    )}
                    {path.length > 2 && (
                        <>
                            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                            <span className="text-sm font-bold text-[#004D7A] whitespace-nowrap">{currentGrade} Courses</span>
                        </>
                    )}
                </div>

                {path.length === 3 && !isEnrolledInCurrentGrade && (
                    <button 
                        onClick={handleEnroll}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#004D7A] text-white rounded-xl text-sm font-bold hover:bg-[#003A5C] transition-all shadow-md active:scale-95"
                    >
                        Enroll in {currentGrade}
                    </button>
                )}
                {path.length === 3 && isEnrolledInCurrentGrade && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-bold border border-green-100">
                        <CheckSquare size={16} /> Enrolled
                    </div>
                )}
            </div>

            {path.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {mainPrograms.map(program => (
                        <div key={program.id} className="bg-white rounded-3xl md:rounded-[2.5rem] p-4 border border-gray-100 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                            <div className="h-40 md:h-48 rounded-2xl md:rounded-[2rem] overflow-hidden mb-6 relative flex-shrink-0">
                                <img src={program.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={program.title} />
                                <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-20`}></div>
                            </div>
                            <div className="px-2 flex-1 flex flex-col">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-[#004D7A] transition-colors">{program.title}</h3>
                                <p className="text-xs md:text-sm text-gray-500 mb-6">{program.desc}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contents</span>
                                        <span className="text-xs md:text-sm font-bold text-gray-900">{program.lessons}+ Lessons</span>
                                    </div>
                                    <button 
                                        onClick={() => setPath([program.id])}
                                        className="w-10 h-10 md:w-12 md:h-12 bg-[#F0F4F8] rounded-xl md:rounded-2xl flex items-center justify-center text-[#004D7A] group-hover:bg-[#004D7A] group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0"
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {currentProgram.levels.map(lvl => (
                        <div 
                            key={lvl.id} 
                            onClick={() => setPath([...path, lvl.id])}
                            className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden"
                        >
                            <div className="h-32 md:h-40 overflow-hidden relative flex-shrink-0">
                                <img src={(lvl as any).img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={lvl.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 md:mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center text-[#004D7A] group-hover:bg-[#004D7A] group-hover:text-white transition-all mb-2 md:mb-0">
                                        <Book size={20} />
                                    </div>
                                    <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lvl.span}</span>
                                </div>
                                <h3 className="text-base md:text-xl font-bold text-gray-900 group-hover:text-[#004D7A] truncate">{lvl.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {path.length === 2 && currentLevel?.grades && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {currentLevel.grades.map(grade => {
                        const isEnrolled = profile.grade === grade;
                        const isEnrolledElsewhere = profile.grade && profile.grade !== grade;
                        
                        return (
                            <div 
                                key={grade}
                                onClick={() => setPath([...path, grade])}
                                className={`
                                    p-6 md:p-8 bg-white border rounded-2xl md:rounded-3xl text-center transition-all cursor-pointer group relative overflow-hidden
                                    ${isEnrolled ? 'border-green-500 bg-green-50/10' : 'border-gray-100 hover:border-[#004D7A] hover:shadow-xl hover:translate-y-[-4px]'}
                                `}
                            >
                                {isEnrolled && (
                                    <div className="absolute top-3 right-3 text-green-500">
                                        <CheckSquare size={18} />
                                    </div>
                                )}
                                {isEnrolledElsewhere && (
                                    <div className="absolute top-3 right-3 text-gray-300">
                                        <Shield size={18} />
                                    </div>
                                )}
                                <div className={`text-xl md:text-2xl font-black mb-2 transition-colors ${isEnrolled ? 'text-green-600' : 'text-gray-300 group-hover:text-[#004D7A]'}`}>{grade}</div>
                                <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">
                                    {isEnrolled ? 'Continue Learning' : isEnrolledElsewhere ? 'Enrollment Locked' : 'View Classes'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {path.length === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mockCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-3xl p-4 border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative">
                            {!isEnrolledInCurrentGrade && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                        <Shield size={24} />
                                    </div>
                                    <h5 className="font-bold text-gray-900 text-sm mb-1">Locked</h5>
                                    <p className="text-[10px] text-gray-500">Enroll in {currentGrade} to access this course</p>
                                </div>
                            )}
                            <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                                <img src={course.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{course.name}</h4>
                            <p className="text-xs text-gray-400 mb-4">Facilitator: {course.teacher}</p>
                            <button 
                                disabled={!isEnrolledInCurrentGrade}
                                className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${isEnrolledInCurrentGrade ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                Open Course
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export const Messages = () => {
    const [selectedChat, setSelectedChat] = React.useState<number>(0);
    const [isListView, setIsListView] = React.useState(true);
    const [messageText, setMessageText] = React.useState('');
    const [isGroupTab, setIsGroupTab] = React.useState(false);

    const [contacts, setContacts] = React.useState([
        { id: 0, name: 'Robin smith', msg: 'Done', time: '1d', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', isGroup: false },
        { id: 1, name: 'Arun Kumar', msg: 'Nope', time: '1d', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', isGroup: false },
        { id: 2, name: 'Amit kumar', msg: 'Happy Birthday', time: '1d', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', isGroup: false },
        { id: 3, name: 'Abishek kumar', msg: 'When is exam?', time: '1d', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100', isGroup: false },
        { id: 4, name: 'Bivesh kumar', msg: 'Hello', time: '2d', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100', isGroup: false },
        { id: 5, name: 'Clara john', msg: 'Chemistry test', time: '2d', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', isGroup: false },
        { id: 6, name: 'Deepthi manohar', msg: 'I have completed', time: '2d', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', isGroup: false },
    ]);

    const [chatMessages, setChatMessages] = React.useState<Record<number, any[]>>({
        0: [
            { id: 1, text: 'Hey There?', sender: 'them' },
            { id: 2, text: 'Hello!', sender: 'me' },
            { id: 3, text: 'I am fine and how are you?', sender: 'them' },
        ],
        1: [{ id: 1, text: 'Are you coming?', sender: 'them' }],
    });

    const handleSelectChat = (id: number) => {
        setSelectedChat(id);
        setIsListView(false);
    };

    const handleSendMessage = () => {
        if (!messageText.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'me',
        };

        setChatMessages(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), newMessage]
        }));

        setContacts(prev => prev.map(c => 
            c.id === selectedChat ? { ...c, msg: messageText, time: 'Just now' } : c
        ));

        setMessageText('');
    };

    const handleCreateGroup = () => {
        const groupName = prompt('Enter Group Name:');
        if (!groupName) return;

        const newId = contacts.length;
        const newGroup = {
            id: newId,
            name: groupName,
            msg: 'Group created',
            time: 'Just now',
            avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100',
            isGroup: true
        };

        setContacts([newGroup, ...contacts]);
        setChatMessages(prev => ({ ...prev, [newId]: [] }));
        setIsGroupTab(true);
    };

    const filteredContacts = contacts.filter(c => isGroupTab ? c.isGroup : !c.isGroup);
    const activeContact = contacts.find(c => c.id === selectedChat) || contacts[0];
    const currentMessages = chatMessages[selectedChat] || [];

    return (
        <Layout title="Messages">
            <div className="flex gap-6 h-[calc(100vh-16rem)] relative overflow-hidden">
                {/* Left Panel: Contacts */}
                <div className={`
                    w-full md:w-80 bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden shadow-sm transition-all duration-300
                    ${!isListView && 'hidden md:flex'}
                `}>
                    <div className="p-4 border-b border-gray-50 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                placeholder="Search" 
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/20" 
                            />
                        </div>
                        <button 
                            onClick={handleCreateGroup}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                            title="Create Group"
                        >
                            <Folder size={18} />
                        </button>
                    </div>
                    <div className="flex border-b border-gray-50 text-xs font-bold text-gray-400">
                        <button 
                            onClick={() => setIsGroupTab(false)}
                            className={`flex-1 py-3 transition-colors ${!isGroupTab ? 'text-[#111827] border-b-2 border-[#111827]' : 'hover:text-gray-600'}`}
                        >
                            Chat
                        </button>
                        <button 
                            onClick={() => setIsGroupTab(true)}
                            className={`flex-1 py-3 transition-colors ${isGroupTab ? 'text-[#111827] border-b-2 border-[#111827]' : 'hover:text-gray-600'}`}
                        >
                            Groups
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar text-left font-medium">
                        {filteredContacts.map((contact) => (
                            <div 
                                key={contact.id} 
                                onClick={() => handleSelectChat(contact.id)}
                                className={`flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedChat === contact.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                            >
                                <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt={contact.name} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate text-left">{contact.name}</h4>
                                    <p className="text-xs text-gray-400 truncate text-left">{contact.msg}</p>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{contact.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Chat Detail */}
                <div className={`
                    flex-1 bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden shadow-sm transition-all duration-300
                    ${isListView && 'hidden md:flex'}
                `}>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsListView(true)}
                                className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="relative flex-shrink-0">
                                <img src={activeContact.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" alt="avatar" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="text-left">
                                <h3 className="text-xs md:text-sm font-bold text-gray-900 leading-none mb-1">{activeContact.name}</h3>
                                <p className="text-[9px] md:text-[11px] text-gray-400">Online . Last seen 3.00 pm</p>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-gray-50/30 custom-scrollbar">
                        {currentMessages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                <MessageSquare size={48} className="opacity-20" />
                                <p className="text-sm font-medium">No messages yet. Say hello!</p>
                            </div>
                        )}
                        {currentMessages.map(msg => (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                                {msg.sender === 'them' && <img src={activeContact.avatar} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-100 flex-shrink-0" />}
                                <div className={`
                                    p-2.5 md:p-3 rounded-2xl text-xs md:text-sm max-w-[70%] sm:max-w-md shadow-sm text-left font-medium
                                    ${msg.sender === 'me' 
                                        ? 'bg-[#2D2DAA] text-white rounded-tr-none shadow-md' 
                                        : 'bg-gray-200 text-gray-800 rounded-tl-none'}
                                `}>
                                    {msg.text}
                                </div>
                                {msg.sender === 'me' && (
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-white flex-shrink-0">
                                        ME
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 md:p-4 border-t border-gray-50 flex items-center gap-2 md:gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg md:rounded-xl flex-shrink-0">
                            <Paperclip size={18} className="md:w-5 md:h-5 rotate-45" />
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..." 
                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-100 rounded-xl md:rounded-2xl text-xs md:text-sm outline-none focus:border-blue-400 transition-all font-medium pr-10 md:pr-12" 
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-blue-500 text-white rounded-lg md:rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex-shrink-0"
                            >
                                <Send size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export const Settings = () => {
    const { updateUser, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = React.useState<'main' | 'personal' | 'security' | 'notifications'>('main');
    
    // User profile state
    const [profile, setProfile] = React.useState(() => {
        const saved = localStorage.getItem('soma_profile');
        return saved ? JSON.parse(saved) : {
            name: 'Swetha shankaresh',
            email: 'swetha@somabox.com',
            phone: '+250 788 000 000',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
        };
    });

    // Notification settings state
    const [notifications, setNotifications] = React.useState(() => {
        const saved = localStorage.getItem('soma_notifications');
        return saved ? JSON.parse(saved) : {
            emailAlerts: true,
            pushNotifications: true,
            weeklyReports: false
        };
    });

    React.useEffect(() => {
        localStorage.setItem('soma_profile', JSON.stringify(profile));
    }, [profile]);

    React.useEffect(() => {
        localStorage.setItem('soma_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newEmail = formData.get('email') as string;
        setProfile({
            ...profile,
            name: formData.get('name') as string,
            email: newEmail,
            phone: formData.get('phone') as string,
            grade: formData.get('grade') as string,
        });
        updateUser(newEmail);
        setActiveSection('main');
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock success
        alert('Password updated successfully!');
        setActiveSection('main');
    };

    const handleDeleteClick = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteAccount();
            navigate('/signup');
        }
    };

    if (activeSection === 'personal') {
        const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];
        return (
            <Layout title="Personal Information">
                <div className="max-w-xl">
                    <button onClick={() => setActiveSection('main')} className="flex items-center gap-2 text-gray-400 hover:text-[#004D7A] mb-8 font-bold transition-colors">
                        <ArrowLeft size={16} /> Back to Settings
                    </button>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">Full Name</label>
                            <input 
                                name="name"
                                defaultValue={profile.name}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3B82F6] transition-all font-medium"
                                required 
                            />
                        </div>
                        <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">Email Address</label>
                                <input 
                                    name="email"
                                    type="email"
                                    defaultValue={profile.email}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3B82F6] transition-all font-medium"
                                    required 
                                />
                            </div>
                            <div className="w-full md:w-32 space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">Grade/Level</label>
                                <select 
                                    name="grade"
                                    defaultValue={profile.grade || 'S2'}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3B82F6] transition-all font-medium appearance-none"
                                >
                                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">Phone Number</label>
                            <input 
                                name="phone"
                                defaultValue={profile.phone}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3B82F6] transition-all font-medium"
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-[#004D7A] text-white rounded-2xl font-bold hover:bg-[#003A5C] transition-all shadow-lg active:scale-95">
                            Save Changes
                        </button>
                    </form>
                </div>
            </Layout>
        );
    }

    if (activeSection === 'security') {
        return (
            <Layout title="Security">
                <div className="max-w-xl">
                    <button onClick={() => setActiveSection('main')} className="flex items-center gap-2 text-gray-400 hover:text-[#004D7A] mb-8 font-bold transition-colors">
                        <ArrowLeft size={16} /> Back to Settings
                    </button>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">Current Password</label>
                            <input 
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3B82F6] transition-all font-medium"
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">New Password</label>
                            <input 
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3B82F6] transition-all font-medium"
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block">Confirm New Password</label>
                            <input 
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3B82F6] transition-all font-medium"
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-[#004D7A] text-white rounded-2xl font-bold hover:bg-[#003A5C] transition-all shadow-lg active:scale-95">
                            Update Password
                        </button>
                    </form>
                </div>
            </Layout>
        );
    }

    if (activeSection === 'notifications') {
        const toggle = (key: keyof typeof notifications) => {
            setNotifications({ ...notifications, [key]: !notifications[key] });
        };

        return (
            <Layout title="Notifications">
                <div className="max-w-xl">
                    <button onClick={() => setActiveSection('main')} className="flex items-center gap-2 text-gray-400 hover:text-[#004D7A] mb-8 font-bold transition-colors">
                        <ArrowLeft size={16} /> Back to Settings
                    </button>
                    <div className="space-y-4">
                        {[
                            { id: 'emailAlerts', title: 'Email Alerts', desc: 'Get updates in your inbox' },
                            { id: 'pushNotifications', title: 'Push Notifications', desc: 'Real-time alerts on your device' },
                            { id: 'weeklyReports', title: 'Weekly Reports', desc: 'A summary of your weekly progress' },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group">
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">{item.title}</div>
                                    <div className="text-xs text-gray-400">{item.desc}</div>
                                </div>
                                <button 
                                    onClick={() => toggle(item.id as keyof typeof notifications)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.id as keyof typeof notifications] ? 'bg-[#22C55E]' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Settings">
            <div className="max-w-2xl mx-auto md:mx-0">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-gray-100 text-center md:text-left">
                    <div className="relative">
                        <img className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl object-cover" src={profile.avatar} alt="Profile" />
                        <button className="absolute -bottom-2 -right-2 p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-100 text-[#004D7A]">
                            <User size={14} className="md:w-4 md:h-4" />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">{profile.name}</h2>
                        <p className="text-gray-500 text-xs md:text-sm">Update your photo and personal details.</p>
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                    {[
                        { id: 'personal', title: 'Personal Information', desc: 'Edit your name, email and phone number', icon: User },
                        { id: 'security', title: 'Security', desc: 'Password and authentication settings', icon: Shield },
                        { id: 'notifications', title: 'Notifications', desc: 'Manage your alert preferences', icon: Bell }
                    ].map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => setActiveSection(item.id as any)}
                            className="flex items-center justify-between p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-3xl cursor-pointer hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-2xl text-gray-400 group-hover:text-[#004D7A] transition-colors shadow-sm">
                                    <item.icon size={20} className="md:w-[22px] md:h-[22px]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm md:text-base text-gray-900">{item.title}</div>
                                    <div className="text-[10px] md:text-xs text-gray-400">{item.desc}</div>
                                </div>
                            </div>
                            <div className="text-gray-300 group-hover:text-gray-600 flex-shrink-0">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    ))}
                    
                    <div 
                        onClick={handleDeleteClick}
                        className="flex items-center justify-between p-4 md:p-6 bg-red-50/50 rounded-2xl md:rounded-3xl cursor-pointer hover:bg-red-50 transition-all group border border-transparent hover:border-red-100"
                    >
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-2xl text-red-400 shadow-sm">
                                <Trash2 size={20} className="md:w-[22px] md:h-[22px]" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm md:text-base text-red-600">Delete Account</div>
                                <div className="text-[10px] md:text-xs text-red-400">Permanently remove your account data</div>
                            </div>
                        </div>
                        <div className="text-red-200 group-hover:text-red-400 flex-shrink-0">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

