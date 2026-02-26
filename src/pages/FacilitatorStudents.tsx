import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Users, Search, Mail, Clock, BookOpen, CheckCircle, TrendingUp } from 'lucide-react'
import { getMyCourses, getAllStudents, Course } from '../api/course.api'
import { getAllProgress } from '../api/progress.api'
import { parseJsonSafe } from '../utils/storage'

interface StudentRow {
  studentId: string
  name: string
  email: string
  courses: {
    courseId: string
    courseName: string
    progress: number
    status: string
    lastUpdated: string
  }[]
  joinDate: string
}

/** Build a name+email lookup map from all available sources */
function buildStudentLookup(
  apiStudents: any[],
  localUsers: any[],
  localEnrollments: any[]
): Map<string, { name: string; email: string; joinDate: string }> {
  const map = new Map<string, { name: string; email: string; joinDate: string }>()

  // Unified helper to index by multiple identifiers
  const addToMap = (id: string, name: string, email: string, joinDate: string) => {
    if (!id) return
    const entry = { name, email, joinDate }
    map.set(id, entry)
    map.set(id.toLowerCase(), entry)
    if (email) {
      map.set(email, entry)
      map.set(email.toLowerCase(), entry)
    }
  }

  // 1. From API
  for (const s of apiStudents) {
    const id = String(s.id || s._id || s.studentId || s.userId || s.email || '')
    const name =
      s.name ||
      (s.firstName ? `${s.firstName} ${s.lastName || ''}`.trim() : '') ||
      s.username ||
      s.email?.split('@')[0] ||
      'Student'
    addToMap(id, name, s.email || '', s.createdAt || s.joinDate || '')
  }

  // 2. From localStorage soma_users (registered accounts)
  for (const u of localUsers) {
    const id = String(u.id || u._id || u.email || u.userId || '')
    const name = u.name || u.username || u.email?.split('@')[0] || 'Student'
    addToMap(id, name, u.email || '', u.createdAt || '')
  }

  // 3. From localStorage soma_enrollments (most reliable: has studentEmail + studentName)
  for (const e of localEnrollments) {
    const id = String(e.studentId || e.studentEmail || '')
    const name = e.studentName || e.studentEmail?.split('@')[0] || 'Student'
    addToMap(id, name, e.studentEmail || '', e.enrolledAt || '')
  }

  return map
}

export const FacilitatorStudents = () => {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseCount, setCourseCount] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 1. Get facilitator's courses — keep in a LOCAL variable (not state) so it's
        //    available synchronously when we process progress records below
        let facilitatorCourses: Course[] = []
        try {
          facilitatorCourses = await getMyCourses()
        } catch (err) {
          console.error('Failed to fetch courses:', err)
        }
        setCourseCount(facilitatorCourses.length)
        const facilitatorCourseIds = new Set(facilitatorCourses.map(c => c.id))
        const courseById = new Map(facilitatorCourses.map(c => [c.id, c]))

        // 2. Get progress from backend
        const progress = await getAllProgress()

        // 3. Build student lookup from every available source
        let apiStudents: any[] = []
        try {
          apiStudents = await getAllStudents()
        } catch (err) {
          console.error('getAllStudents failed, relying on localStorage:', err)
        }
        const localUsers = parseJsonSafe<any[]>(localStorage.getItem('soma_users'), [])
        const localEnrollments = parseJsonSafe<any[]>(localStorage.getItem('soma_enrollments'), [])
        const studentLookup = buildStudentLookup(apiStudents, localUsers, localEnrollments)

        // 4. Group progress records by student, restricted to this facilitator's courses
        const studentMap = new Map<string, StudentRow>()

        const resolveStudent = (studentId: string) => {
          const key = String(studentId).toLowerCase().trim()
          return studentLookup.get(key) || null
        }

        // From API progress
        if (Array.isArray(progress) && progress.length > 0) {
          for (const p of progress) {
            if (facilitatorCourseIds.size > 0 && !facilitatorCourseIds.has(p.courseId)) continue

            const studentId = String(p.studentId)
            if (!studentMap.has(studentId)) {
              const info = resolveStudent(studentId)
              studentMap.set(studentId, {
                studentId,
                name: info?.name || (studentId.includes('@') ? studentId.split('@')[0] : 'Student'),
                email: info?.email || (studentId.includes('@') ? studentId : ''),
                courses: [],
                joinDate: info?.joinDate || '',
              })
            }
            const student = studentMap.get(studentId)!
            if (!student.courses.find(c => c.courseId === p.courseId)) {
              const courseInfo = courseById.get(p.courseId)
              student.courses.push({
                courseId: p.courseId,
                courseName: courseInfo?.title || 'Unknown Course',
                progress: p.progress_percentage ?? 0,
                status: p.status ?? (p.progress_percentage === 100 ? 'completed' : 'in-progress'),
                lastUpdated: p.updatedAt || new Date().toISOString(),
              })
            }
          }
        }

        // Also pull from soma_enrollments as a supplementary source
        // so students show up even if they haven't started studying yet
        for (const e of localEnrollments) {
          if (!e.courseId || !e.studentId) continue
          if (facilitatorCourseIds.size > 0 && !facilitatorCourseIds.has(e.courseId)) continue

          const studentId = String(e.studentId || e.studentEmail || '')
          if (!studentId) continue

          if (!studentMap.has(studentId)) {
            const info = resolveStudent(studentId)
            studentMap.set(studentId, {
              studentId,
              name: e.studentName || info?.name || (studentId.includes('@') ? studentId.split('@')[0] : 'Student'),
              email: e.studentEmail || info?.email || (studentId.includes('@') ? studentId : ''),
              courses: [],
              joinDate: e.enrolledAt || info?.joinDate || '',
            })
          }
          const student = studentMap.get(studentId)!
          // Fill in enrollment if not already in progress data
          if (!student.courses.find(c => c.courseId === e.courseId)) {
            const courseInfo = courseById.get(e.courseId)
            student.courses.push({
              courseId: e.courseId,
              courseName: courseInfo?.title || e.courseName || 'Unknown Course',
              progress: 0,
              status: 'pending',
              lastUpdated: e.enrolledAt || new Date().toISOString(),
            })
          }
          // Always prefer real email/name from enrollment record
          if (e.studentEmail && !student.email) student.email = e.studentEmail
          if (e.studentName && student.name === 'Student') student.name = e.studentName
        }

        setStudents(Array.from(studentMap.values()))
      } catch (error) {
        console.error('Failed to load student data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (progress: number, status: string) => {
    if (progress === 100 || status === 'completed') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
          <CheckCircle size={11} /> Completed
        </span>
      )
    }
    if (progress > 0 || status === 'in-progress') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          <TrendingUp size={11} /> In Progress
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
        Enrolled
      </span>
    )
  }

  return (
    <DashboardLayout title="Students">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
            <p className="text-gray-500 mt-1">{students.length} students enrolled in your courses</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen size={16} />
            <span>{courseCount} Courses</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Students List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Students Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No students match your search' : 'No students have enrolled in your courses yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => {
              const avgProgress = student.courses.length > 0
                ? Math.round(student.courses.reduce((acc, c) => acc + (c.progress || 0), 0) / student.courses.length)
                : 0

              return (
                <div
                  key={student.studentId}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar initial */}
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
                      {(student.name || 'S').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{student.name}</h3>
                          <div className="flex items-center gap-2 text-gray-500 mt-0.5">
                            <Mail size={13} />
                            <span className="text-sm">{student.email || '—'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {student.joinDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={12} />
                              <span>Joined {student.joinDate.split('T')[0]}</span>
                            </div>
                          )}
                          <span className="text-sm font-black text-primary">{avgProgress}% avg</span>
                        </div>
                      </div>

                      {/* Enrolled courses */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {student.courses.map((course, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <span className="text-sm font-medium text-gray-700 truncate flex-1">
                                {course.courseName}
                              </span>
                              {getStatusBadge(course.progress, course.status)}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${course.progress === 100 ? 'bg-green-500' :
                                    course.progress > 50 ? 'bg-primary' : 'bg-blue-400'
                                    }`}
                                  style={{ width: `${course.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-500">{course.progress || 0}%</span>
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

export default FacilitatorStudents
