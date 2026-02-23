import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { EnrollmentDashboard } from './pages/EnrollmentDashboard'
import { FacilitatorDashboard } from './pages/FacilitatorDashboard'
import { Library, Programs, Messages, Settings } from './pages/SubPages'
import StudyCourse from './pages/StudyCourse'
import StudyTopic from './pages/StudyTopic'
import { AuthProvider, useAuth, UserRole } from './auth'

// Editor Imports
import { CourseProvider } from './editor/src/state/CourseContext'
import { EditorProvider } from './editor/src/state/EditorContext'
import { MetadataForm } from './editor/src/components/course/MetadataForm'
import { CourseOutline } from './editor/src/components/course/CourseOutline'
import { EditorLayout } from './editor/src/components/editor/EditorLayout'
import { CourseRendererWrapper } from './editor/src/components/renderer/CourseRendererWrapper'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  return children
}

function RoleRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: UserRole[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective home if they try to access a forbidden role page
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'Facilitator') return <Navigate to="/facilitator/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <EditorProvider>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={['Student']}>
                  <Dashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/library"
              element={
                <RoleRoute allowedRoles={['Student']}>
                  <Library />
                </RoleRoute>
              }
            />
            <Route
              path="/study/:courseId"
              element={
                <RoleRoute allowedRoles={['Student']}>
                  <StudyCourse />
                </RoleRoute>
              }
            />
            <Route
              path="/student/study_topic/:topicId"
              element={
                <RoleRoute allowedRoles={['Student']}>
                  <StudyTopic />
                </RoleRoute>
              }
            />
            <Route
              path="/programs"
              element={
                <RoleRoute allowedRoles={['Student']}>
                  <Programs />
                </RoleRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <RoleRoute allowedRoles={['Student']}>
                  <Messages />
                </RoleRoute>
              }
            />

            {/* Facilitator Routes */}
            <Route
              path="/facilitator/dashboard"
              element={
                <RoleRoute allowedRoles={['Facilitator']}>
                  <FacilitatorDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/facilitator/courses"
              element={
                <RoleRoute allowedRoles={['Facilitator']}>
                  <FacilitatorDashboard />
                </RoleRoute>
              }
            />

            {/* Editor Routes */}
            <Route
              path="/facilitator/create-course"
              element={
                <RoleRoute allowedRoles={['Facilitator']}>
                  <MetadataForm />
                </RoleRoute>
              }
            />
            <Route
              path="/facilitator/course-outline"
              element={
                <RoleRoute allowedRoles={['Facilitator']}>
                  <CourseOutline />
                </RoleRoute>
              }
            />
            <Route
              path="/facilitator/editor/:topicId"
              element={
                <RoleRoute allowedRoles={['Facilitator']}>
                  <EditorLayout />
                </RoleRoute>
              }
            />
            <Route
              path="/facilitator/preview/:topicId"
              element={
                <RoleRoute allowedRoles={['Facilitator', 'Student', 'Admin']}>
                  <CourseRendererWrapper />
                </RoleRoute>
              }
            />
            <Route
              path="/facilitator/preview"
              element={
                <RoleRoute allowedRoles={['Facilitator', 'Student', 'Admin']}>
                  <CourseRendererWrapper />
                </RoleRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/enrollment"
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <EnrollmentDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/add-facilitator"
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/add-admin"
              element={
                <RoleRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            {/* Shared Routes */}
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </EditorProvider>
      </CourseProvider>
    </AuthProvider>
  )
}

