import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Search, Filter, School, Users, ChevronDown } from 'lucide-react'
import { useAuth } from '../auth'
import { getAllCourses, Course } from '../api/course.api'

export const EnrollmentDashboard = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  
  // Real data from API
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const data = await getAllCourses()
        setCourses(data)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch courses:', err)
        setError('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Schools computed from courses (grouped by author/school)
  const schools = React.useMemo(() => {
    const schoolMap = new Map<string, { id: string; name: string; students: number; courses: number }>()
    courses.forEach(course => {
      const schoolName = course.author || 'Unknown School'
      const existing = schoolMap.get(schoolName)
      if (existing) {
        existing.students += course.students || 0
        existing.courses += 1
      } else {
        schoolMap.set(schoolName, {
          id: `s_${schoolName}`,
          name: schoolName,
          students: course.students || 0,
          courses: 1
        })
      }
    })
    return Array.from(schoolMap.values())
  }, [courses])

  // Mock student data for demo
  const studentsBySchool: Record<string, { id: string; name: string; email: string; date: string }[]> = {
    's_Unknown School': [
      { id: 'st1', name: 'John Doe', email: 'john@example.com', date: '2024-01-15' },
      { id: 'st2', name: 'Jane Smith', email: 'jane@example.com', date: '2024-01-16' },
      { id: 'st6', name: 'Alex Chen', email: 'alex@example.com', date: '2024-01-20' },
    ],
  }

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <DashboardLayout title="Enrollment Dashboard">
      <div className="space-y-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-md border border-primary/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-primary/10">
              <h2 className="text-xl font-bold text-gray-900">All Schools</h2>
              <p className="text-sm text-gray-500 mt-1">
                {schools.length} schools with {schools.reduce((acc, s) => acc + s.students, 0)} total students
              </p>
            </div>
            
            <div className="divide-y divide-primary/5">
              {loading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-gray-500">Loading schools...</span>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  {error}
                </div>
              ) : filteredSchools.length > 0 ? filteredSchools.map((item: any) => (
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
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                        <School size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.students} students - {item.courses} courses
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
                  
                  {expandedItems.includes(item.id) && selectedItem === item.id && (
                    <div className="bg-primary/5 px-6 py-4 border-t border-primary/10">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Students in School</h4>
                      <div className="space-y-2">
                        {(studentsBySchool[item.id] || []).map((student: any) => (
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
                        ))}
                        {(studentsBySchool[item.id] || [])?.length === 0 && (
                          <p className="text-sm text-gray-400 italic">No students found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400">
                  No schools found
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {selectedItem ? (
              <>
                <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
                  {(() => {
                    const item = filteredSchools.find((i: any) => i.id === selectedItem)
                    if (!item) return null
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-50 text-green-600">
                            <School size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.courses} courses</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                          <div className="text-center p-4 bg-primary/5 rounded-xl">
                            <p className="text-2xl font-black text-primary">{item.students}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Students</p>
                          </div>
                          <div className="text-center p-4 bg-primary/5 rounded-xl">
                            <p className="text-2xl font-black text-primary">{item.courses}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">Courses</p>
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a School</h3>
                <p className="text-gray-500">Choose a school from the list to view details and enrolled students</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EnrollmentDashboard
