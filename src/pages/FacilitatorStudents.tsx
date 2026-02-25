import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Users, Search, Mail, Clock, BookOpen, ArrowLeft } from 'lucide-react'
import { getAllStudents } from '../api/course.api'
import { getMyCourses, Course } from '../api/course.api'
import { useAuth } from '../auth'

interface Student {
  id: string
  name: string
  email: string
  enrolledCourses: string[]
  joinDate: string
}

export const FacilitatorStudents = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [myCourses, setMyCourses] = useState<Course[]>([])
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // First, get facilitator's courses
        let facilitatorCourseIds: string[] = []
        try {
          const courses = await getMyCourses()
          setMyCourses(courses)
          facilitatorCourseIds = courses.map(c => c.id)
        } catch (err) {
          console.error('Failed to fetch courses:', err)
        }
        
        // Get all students
        let allStudents: Student[] = []
        try {
          const apiStudents = await getAllStudents()
          if (apiStudents && apiStudents.length > 0) {
            allStudents = apiStudents.map((s: any) => ({
              id: s.id || s._id,
              name: s.name || s.email?.split('@')[0] || 'Student',
              email: s.email || '',
              enrolledCourses: s.enrolledCourses || [],
              joinDate: s.joinDate || s.createdAt || new Date().toISOString().split('T')[0]
            }))
          }
        } catch (error) {
          console.error('Failed to load students from API:', error)
        }
        
        // If no students from API, fallback to localStorage
        if (allStudents.length === 0) {
          allStudents = loadFromLocalStorage()
        }
        
        // Filter students to only show those enrolled in facilitator's courses
        let filteredStudents = allStudents
        if (facilitatorCourseIds.length > 0) {
          filteredStudents = allStudents.filter(student => 
            student.enrolledCourses?.some((courseId: string) => 
              facilitatorCourseIds.includes(courseId)
            )
          )
          
          // Also check localStorage enrollments
          const savedEnrollments = localStorage.getItem('soma_enrollments')
          if (savedEnrollments) {
            const enrollments = JSON.parse(savedEnrollments)
            const courseEnrollments = enrollments.filter((e: any) => facilitatorCourseIds.includes(e.courseId))
            const enrollmentStudentIds = [...new Set(courseEnrollments.map((e: any) => e.studentId))]
            
            // Add students from enrollments if not already included
            enrollmentStudentIds.forEach((studentId: unknown) => {
              if (!filteredStudents.find(s => s.id === studentId)) {
                const enrollment = courseEnrollments.find((e: any) => e.studentId === studentId)
                if (enrollment) {
                  filteredStudents.push({
                    id: String(studentId),
                    name: enrollment.studentName || 'Student',
                    email: enrollment.studentEmail || '',
                    enrolledCourses: courseEnrollments
                      .filter((e: any) => e.studentId === studentId)
                      .map((e: any) => e.courseId),
                    joinDate: enrollment.enrolledAt || new Date().toISOString().split('T')[0]
                  })
                }
              }
            })
          }
        }
        
        setStudents(filteredStudents)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadFromLocalStorage = (): Student[] => {
      let allStudents: Student[] = []
      
      const savedUsers = localStorage.getItem('soma_users')
      if (savedUsers) {
        const users = JSON.parse(savedUsers)
        const studentUsers = users
          .filter((u: any) => u.role === 'Student')
          .map((u: any) => ({
            id: u.id || `student_${Math.random().toString(36).substr(2, 9)}`,
            name: u.name || u.email?.split('@')[0] || 'Student',
            email: u.email || '',
            enrolledCourses: u.enrolledCourses || [],
            joinDate: u.joinDate || new Date().toISOString().split('T')[0]
          }))
        allStudents = [...studentUsers]
      }
      
      const savedEnrollments = localStorage.getItem('soma_enrollments')
      if (savedEnrollments) {
        const enrollments = JSON.parse(savedEnrollments)
        const enrollmentStudentIds = [...new Set(enrollments.map((e: any) => e.studentId))] as string[]
        enrollmentStudentIds.forEach((studentId: string) => {
          if (!allStudents.find(s => s.id === studentId)) {
            const enrollment = enrollments.find((e: any) => e.studentId === studentId)
            allStudents.push({
              id: studentId,
              name: enrollment?.studentName || 'Student',
              email: enrollment?.studentEmail || '',
              enrolledCourses: [enrollment?.courseId].filter(Boolean),
              joinDate: enrollment?.enrolledAt || new Date().toISOString().split('T')[0]
            })
          }
        })
      }
      
      return allStudents
    }

    loadData()
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get course names for a student
  const getCourseNames = (courseIds: string[]) => {
    return courseIds.map(id => {
      const course = myCourses.find(c => c.id === id)
      return course?.title || 'Unknown Course'
    })
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
            <span>{myCourses.length} Courses</span>
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
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Students Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No students match your search' : 'No students have enrolled yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-surface rounded-full flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{student.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <Mail size={14} />
                      <span className="text-sm truncate">{student.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock size={14} />
                    <span>Joined: {student.joinDate}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase">Enrolled Courses:</span>
                    {getCourseNames(student.enrolledCourses).map((courseName, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <BookOpen size={12} className="text-primary" />
                        <span className="text-sm text-gray-700 truncate">{courseName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default FacilitatorStudents
