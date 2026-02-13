import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Search, Filter, BookOpen, Users, School, ChevronDown, ChevronRight } from 'lucide-react'

export const EnrollmentDashboard = () => {
  const [filterType, setFilterType] = useState<'courses' | 'schools'>('courses')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Mock data for courses
  const courses = [
    { id: 'c1', name: 'Advanced React Patterns', students: 240, school: 'Tech Academy' },
    { id: 'c2', name: 'Fullstack Architecture', students: 180, school: 'Tech Academy' },
    { id: 'c3', name: 'UI/UX Design Systems', students: 320, school: 'Design Institute' },
    { id: 'c4', name: 'Data Science Fundamentals', students: 150, school: 'Data Science Hub' },
    { id: 'c5', name: 'Mobile Development', students: 200, school: 'Tech Academy' },
  ]

  // Mock data for schools
  const schools = [
    { id: 's1', name: 'Tech Academy', students: 620, courses: 5 },
    { id: 's2', name: 'Design Institute', students: 480, courses: 3 },
    { id: 's3', name: 'Data Science Hub', students: 350, courses: 2 },
    { id: 's4', name: 'Business School', students: 290, courses: 4 },
  ]

  // Mock students data
  const studentsByCourse: { [key: string]: { id: string; name: string; email: string; date: string }[] } = {
    'c1': [
      { id: 'st1', name: 'John Doe', email: 'john@example.com', date: '2024-01-15' },
      { id: 'st2', name: 'Jane Smith', email: 'jane@example.com', date: '2024-01-16' },
      { id: 'st3', name: 'Mike Johnson', email: 'mike@example.com', date: '2024-01-18' },
    ],
    'c2': [
      { id: 'st4', name: 'Sarah Williams', email: 'sarah@example.com', date: '2024-01-10' },
      { id: 'st5', name: 'Tom Brown', email: 'tom@example.com', date: '2024-01-12' },
    ],
  }

  const studentsBySchool: { [key: string]: { id: string; name: string; email: string; date: string }[] } = {
    's1': [
      { id: 'st1', name: 'John Doe', email: 'john@example.com', date: '2024-01-15' },
      { id: 'st2', name: 'Jane Smith', email: 'jane@example.com', date: '2024-01-16' },
      { id: 'st6', name: 'Alex Chen', email: 'alex@example.com', date: '2024-01-20' },
    ],
    's2': [
      { id: 'st3', name: 'Mike Johnson', email: 'mike@example.com', date: '2024-01-18' },
      { id: 'st7', name: 'Emily Davis', email: 'emily@example.com', date: '2024-01-22' },
    ],
  }

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const displayedItems = filterType === 'courses' ? filteredCourses : filteredSchools

  return (
    <DashboardLayout title="Enrollment Dashboard">
      <div className="space-y-8">
        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            <Filter size={20} />
            {filterType === 'courses' ? 'Filter by Course' : 'Filter by School'}
            <ChevronDown size={20} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full mt-2 w-48 bg-white/40 backdrop-blur-md border border-primary/10 rounded-xl shadow-xl z-10 overflow-hidden">
              <button
                onClick={() => { setFilterType('courses'); setSelectedItem(null); setSearchTerm(''); setShowDropdown(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  filterType === 'courses' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-gray-700'
                }`}
              >
                <BookOpen size={18} />
                By Course
              </button>
              <button
                onClick={() => { setFilterType('schools'); setSelectedItem(null); setSearchTerm(''); setShowDropdown(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  filterType === 'schools' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-gray-700'
                }`}
              >
                <School size={18} />
                By School
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={filterType === 'courses' ? 'Search courses...' : 'Search schools...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-md border border-primary/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Main Content - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - List */}
          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-primary/10">
              <h2 className="text-xl font-bold text-gray-900">
                {filterType === 'courses' ? 'All Courses' : 'All Schools'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filterType === 'courses' 
                  ? `${courses.length} courses with ${courses.reduce((acc, c) => acc + c.students, 0)} total enrollments`
                  : `${schools.length} schools with ${schools.reduce((acc, s) => acc + s.students, 0)} total students`
                }
              </p>
            </div>
            
            <div className="divide-y divide-primary/5">
              {displayedItems.length > 0 ? displayedItems.map((item: any) => (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setSelectedItem(item.id)
                      if (!expandedItems.includes(item.id)) {
                        toggleExpand(item.id)
                      }
                    }}
                    className={`w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-all ${
                      selectedItem === item.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        filterType === 'courses' 
                          ? 'bg-blue-50 text-primary-dark' 
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {filterType === 'courses' ? <BookOpen size={20} /> : <School size={20} />}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {filterType === 'courses' 
                            ? `${item.students} students` 
                            : `${item.students} students • ${item.courses} courses`
                          }
                        </p>
                      </div>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`text-gray-400 transition-transform ${
                        expandedItems.includes(item.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Expanded Students List */}
                  {expandedItems.includes(item.id) && selectedItem === item.id && (
                    <div className="bg-primary/5 px-6 py-4 border-t border-primary/10">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">
                        {filterType === 'courses' ? 'Enrolled Students' : 'Students in School'}
                      </h4>
                      <div className="space-y-2">
                        {filterType === 'courses' 
                          ? (studentsByCourse[item.id] || []).map((student) => (
                              <div key={student.id} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.email}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-400">{student.date}</span>
                              </div>
                            ))
                          : (studentsBySchool[item.id] || []).map((student) => (
                              <div key={student.id} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.email}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-400">{student.date}</span>
                              </div>
                            ))
                        }
                        {(filterType === 'courses' ? studentsByCourse[item.id] : studentsBySchool[item.id])?.length === 0 && (
                          <p className="text-sm text-gray-400 italic">No students found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400">
                  No {filterType === 'courses' ? 'courses' : 'schools'} found
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Details Panel */}
          <div className="space-y-6">
            {selectedItem ? (
              <>
                <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
                  {(() => {
                    const item = displayedItems.find((i: any) => i.id === selectedItem)
                    if (!item) return null
                    const isCourse = filterType === 'courses'
                    const courseItem = item as { id: string; name: string; students: number; school: string }
                    const schoolItem = item as { id: string; name: string; students: number; courses: number }
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            filterType === 'courses' 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {filterType === 'courses' ? <BookOpen size={24} /> : <School size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{isCourse ? courseItem.name : schoolItem.name}</h4>
                            <p className="text-sm text-gray-500">
                              {isCourse ? courseItem.school : `${schoolItem.courses} courses`}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                          <div className="text-center p-4 bg-primary/5 rounded-xl">
                            <p className="text-2xl font-black text-primary">{isCourse ? courseItem.students : schoolItem.students}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">
                              {filterType === 'courses' ? 'Students' : 'Total Students'}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-primary/5 rounded-xl">
                            <p className="text-2xl font-black text-primary">
                              {isCourse ? '100%' : schoolItem.courses}
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase">
                              {filterType === 'courses' ? 'Completion' : 'Courses'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Active Students</span>
                      <span className="font-bold text-green-600">85%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Course Completion</span>
                      <span className="font-bold text-primary">72%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select an Item</h3>
                <p className="text-gray-500">Choose a {filterType === 'courses' ? 'course' : 'school'} from the list to view details and enrolled students</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EnrollmentDashboard
