import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { TrendingUp, Search, BookOpen, Users, CheckCircle } from 'lucide-react'
import { getAllProgress } from '../api/progress.api'
import { getAllCourses, getMyCourses, getAllStudents } from '../api/course.api'
import { parseJsonSafe } from '../utils/storage'

interface StudentProgress {
  studentId: string
  email: string
  name: string
  courses: {
    courseId: string
    courseName: string
    progress: number
    status: string
    lastUpdated: string
  }[]
}

export const FacilitatorProgress = () => {
  const [progressData, setProgressData] = useState<StudentProgress[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProgress, setFilterProgress] = useState<string>('all')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load facilitator's courses — kept in LOCAL variable so it's available
        // synchronously when we map progress records below (React state is async)
        let myCoursesData: any[] = []
        try {
          myCoursesData = await getMyCourses()
        } catch (err) {
          console.error('Failed to fetch my courses, falling back to all courses:', err)
          try { myCoursesData = await getAllCourses() } catch { }
        }
        setCourses(myCoursesData)
        const facilitatorCourseIds = new Set(myCoursesData.map((c: any) => c.id))
        const courseById = new Map(myCoursesData.map((c: any) => [c.id, c]))

        // Load progress data from backend
        const progress = await getAllProgress()

        // Build student lookup from API + localStorage fallbacks
        let apiStudents: any[] = []
        try {
          apiStudents = await getAllStudents()
        } catch (err) {
          console.error('getAllStudents failed, relying on localStorage:', err)
        }
        const localUsers = parseJsonSafe<any[]>(localStorage.getItem('soma_users'), [])
        const localEnrollments = parseJsonSafe<any[]>(localStorage.getItem('soma_enrollments'), [])

        // Build a unified student info map (id/email → {name, email})
        const studentLookup = new Map<string, { name: string; email: string; joinDate: string }>()
        const addToLookup = (id: string, name: string, email: string, joinDate = '') => {
          if (!id) return
          const entry = { name, email, joinDate }
          studentLookup.set(id, entry)
          studentLookup.set(id.toLowerCase(), entry)
          if (email) {
            studentLookup.set(email, entry)
            studentLookup.set(email.toLowerCase(), entry)
          }
        }
        for (const s of apiStudents) {
          const id = String(s.id || s._id || s.studentId || s.userId || '')
          const name = s.name ||
            (s.firstName ? `${s.firstName} ${s.lastName || ''}`.trim() : '') ||
            s.username ||
            s.email?.split('@')[0] ||
            'Student'
          addToLookup(id, name, s.email || '', s.createdAt || '')
        }
        for (const u of localUsers) {
          const id = String(u.id || u._id || u.email || '')
          addToLookup(id, u.name || u.email?.split('@')[0] || 'Student', u.email || '', u.createdAt || '')
        }
        for (const e of localEnrollments) {
          const id = String(e.studentId || e.studentEmail || '')
          addToLookup(id, e.studentName || e.studentEmail?.split('@')[0] || 'Student', e.studentEmail || '', e.enrolledAt || '')
        }

        const resolve = (id: string) => {
          const target = String(id).toLowerCase().trim()
          return studentLookup.get(target) || null
        }

        // Group progress by student
        const progressMap = new Map<string, any>()

        if (Array.isArray(progress) && progress.length > 0) {
          for (const p of progress) {
            if (facilitatorCourseIds.size > 0 && !facilitatorCourseIds.has(p.courseId)) continue
            const studentId = String(p.studentId)
            if (!progressMap.has(studentId)) {
              const info = resolve(studentId)
              progressMap.set(studentId, {
                studentId,
                email: info?.email || (studentId.includes('@') ? studentId : ''),
                name: info?.name || (studentId.includes('@') ? studentId.split('@')[0] : 'Student'),
                courses: []
              })
            }
            const sp = progressMap.get(studentId)
            const courseInfo = courseById.get(p.courseId)
            sp.courses.push({
              courseId: p.courseId,
              courseName: courseInfo?.title || 'Unknown Course',
              progress: p.progress_percentage || 0,
              status: p.status || (p.progress_percentage === 100 ? 'completed' : 'in-progress'),
              lastUpdated: p.updatedAt || new Date().toISOString()
            })
          }
        }

        // Also pick up enrolled-but-not-started students from soma_enrollments
        for (const e of localEnrollments) {
          if (!e.courseId || !e.studentId) continue
          if (facilitatorCourseIds.size > 0 && !facilitatorCourseIds.has(e.courseId)) continue
          const studentId = String(e.studentId || e.studentEmail || '')
          if (!progressMap.has(studentId)) {
            const info = resolve(studentId)
            progressMap.set(studentId, {
              studentId,
              email: e.studentEmail || info?.email || '',
              name: e.studentName || info?.name || (studentId.includes('@') ? studentId.split('@')[0] : 'Student'),
              courses: []
            })
          }
          const sp = progressMap.get(studentId)!
          if (!sp.courses.find((c: any) => c.courseId === e.courseId)) {
            const courseInfo = courseById.get(e.courseId)
            sp.courses.push({
              courseId: e.courseId,
              courseName: courseInfo?.title || e.courseName || 'Unknown Course',
              progress: 0,
              status: 'pending',
              lastUpdated: e.enrolledAt || new Date().toISOString()
            })
          }
          if (e.studentEmail && !sp.email) sp.email = e.studentEmail
          if (e.studentName && sp.name === 'Student') sp.name = e.studentName
        }

        setProgressData(Array.from(progressMap.values()))
      } catch (error) {
        console.error('Failed to load progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate stats
  const totalStudents = progressData.length
  const totalEnrollments = progressData.reduce((acc, student) => acc + (student.courses?.length || 0), 0)
  const completedCourses = progressData.reduce((acc, student) => {
    return acc + (student.courses?.filter((c: any) => c.status === 'completed' || c.progress === 100).length || 0)
  }, 0)
  const inProgressCourses = progressData.reduce((acc, student) => {
    return acc + (student.courses?.filter((c: any) => c.progress > 0 && c.progress < 100).length || 0)
  }, 0)

  // Filter students based on search and progress filter
  const filteredStudents = progressData.filter(student => {
    const searchTarget = `${student.name} ${student.email}`.toLowerCase()
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase())

    let matchesFilter = true
    if (filterProgress === 'completed') {
      matchesFilter = student.courses?.every((c: any) => c.progress === 100)
    } else if (filterProgress === 'in_progress') {
      matchesFilter = student.courses?.some((c: any) => c.progress > 0 && c.progress < 100)
    } else if (filterProgress === 'not_started') {
      matchesFilter = student.courses?.every((c: any) => c.progress === 0)
    }

    return matchesSearch && matchesFilter
  })

  // Get color based on progress
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-500'
    if (progress >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProgressBg = (progress: number) => {
    if (progress >= 80) return 'bg-green-100'
    if (progress >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getStatusBadge = (progress: number, status: string) => {
    if (progress === 100 || status === 'completed') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>
    }
    if (progress > 0 || status === 'in-progress') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">In Progress</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Not Started</span>
  }

  return (
    <DashboardLayout title="Progress Tracking">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <span className="text-sm text-gray-500">Total Students</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{totalStudents}</p>
          </div>

          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <span className="text-sm text-gray-500">Total Enrollments</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{totalEnrollments}</p>
          </div>

          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{completedCourses}</p>
          </div>

          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <span className="text-sm text-gray-500">In Progress</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{inProgressCourses}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterProgress('all')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterProgress === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterProgress('completed')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterProgress === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterProgress('in_progress')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterProgress === 'in_progress'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterProgress('not_started')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterProgress === 'not_started'
                ? 'bg-gray-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              Not Started
            </button>
          </div>
        </div>

        {/* Progress List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading progress data...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Progress Data</h3>
            <p className="text-gray-500">
              {searchTerm || filterProgress !== 'all'
                ? 'No students match your filters'
                : 'No student progress data available yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student, index) => {
              const avgProgress = student.courses?.length > 0
                ? Math.round(student.courses.reduce((acc: number, c: any) => acc + (c.progress || 0), 0) / student.courses.length)
                : 0

              return (
                <div key={index} className="bg-white/60 backdrop-blur-md border border-primary/10 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    {/* Progress Circle */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke="#e5e7eb"
                          strokeWidth="5"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray={`${avgProgress * 2.2} 220`}
                          className={`${getProgressColor(avgProgress)} transition-all duration-500`}
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${getProgressColor(avgProgress)}`}>
                        {avgProgress}%
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{student.name}</h3>
                        <span className="text-sm text-gray-500">{student.email}</span>
                      </div>

                      {/* Course Progress */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {student.courses?.map((course: any, courseIndex: number) => (
                          <div key={courseIndex} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 truncate">{course.courseName || course.courseId}</span>
                              {getStatusBadge(course.progress, course.status)}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getProgressBg(course.progress)}`}
                                  style={{ width: `${course.progress || 0}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${getProgressColor(course.progress)}`}>
                                {course.progress || 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default FacilitatorProgress
