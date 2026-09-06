import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, MapPin, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { Course } from '../../types';
import {
  fetchCourses,
  createCourse,
  CreateCoursePayload,
  INITIAL_RETREAT_BATCHES,
} from '../../services/api';
import { CreateBatchModal } from './CreateBatchModal';
import { CourseBatchDetailView } from './CourseBatchDetailView';

export const CourseBatchesManagementView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load courses from backend database
  const loadBatches = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchCourses();
      if (Array.isArray(data) && data.length > 0) {
        // Assign batch numbers if missing
        const formatted = data.map((c, idx) => {
          if (!c.batchNumber) {
            const seq = String(idx + 1).padStart(2, '0');
            return { ...c, batchNumber: `Batch #${c.year || 2026}-${seq}` };
          }
          return c;
        });
        setCourses(formatted);
      } else if (Array.isArray(data) && data.length === 0) {
        setCourses([]);
      }
    } catch (err) {
      console.warn('[Admin Batches] Could not fetch remote courses:', err);
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch courses from server.');
      // Fallback only if state is empty
      setCourses((prev) => (prev.length > 0 ? prev : INITIAL_RETREAT_BATCHES));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = async (payload: CreateCoursePayload) => {
    const newCourse = await createCourse(payload);
    // Assign sequential batch number
    const seq = String(courses.length + 1).padStart(2, '0');
    const batchNumber = `Batch #${payload.year || 2026}-${seq}`;
    const courseWithBatch: Course = { ...newCourse, batchNumber };

    setCourses((prev) => [...prev, courseWithBatch]);
  };

  const handleUpdateCourse = (updated: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setSelectedCourseId(null);
  };

  // If a course is selected, render CourseBatchDetailView
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  if (selectedCourse) {
    return (
      <CourseBatchDetailView
        course={selectedCourse}
        onBack={() => setSelectedCourseId(null)}
        onUpdateCourse={handleUpdateCourse}
        onDeleteCourse={handleDeleteCourse}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#231a15]">
      {/* 1. Breadcrumbs & Main Heading */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-[#705d53]">
          <span>Admin</span>
          <span>&gt;</span>
          <span className="font-semibold text-[#8c3c0b]">Batches</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#231a15] font-normal tracking-tight">
          Vipassana Retreat Batches
        </h1>
      </div>

      {/* 2. Main White Card Container matching UI Mockup */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-[#231a15]">
              Vipassana Retreat Schedule (2026–2027)
            </h3>
            <p className="text-xs text-[#705d53]">
              Manage residential course capacities and registration windows
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8c3c0b] text-white text-xs font-semibold rounded-xl hover:bg-[#722f07] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch</span>
          </button>
        </div>

        {/* Retreat Batches Grid / Loading / Error */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#705d53]">
            <div className="w-8 h-8 rounded-full border-3 border-[#8c3c0b]/20 border-t-[#8c3c0b] animate-spin" />
            <p className="text-xs font-medium">Loading retreat batches from database...</p>
          </div>
        ) : fetchError && courses.length === 0 ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
            <p className="text-xs text-red-700 font-medium">{fetchError}</p>
            <button
              onClick={loadBatches}
              className="px-4 py-1.5 bg-[#8c3c0b] text-white text-xs font-semibold rounded-xl hover:bg-[#722f07] transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center text-[#705d53] text-xs">
            No retreat batches found on schedule. Click "Add Batch" above to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courses.map((course, idx) => {
              const batchNum = course.batchNumber || `Batch #${course.year}-${String(idx + 1).padStart(2, '0')}`;
              const isOpen = course.status === 'open';
              const isUpcoming = course.status === 'upcoming';
              const isCancelled = course.status === 'cancelled';

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className="p-5 rounded-xl border border-[#dbc1b4]/60 bg-[#fff8f5] hover:bg-[#fff2e8] hover:border-[#8c3c0b]/40 hover:shadow-xs transition-all cursor-pointer space-y-3 group"
                >
                  {/* Header row: Batch # and Status Badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#8c3c0b]">{batchNum}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[11px] capitalize ${
                        isOpen
                          ? 'bg-[#e8f5e9] text-[#2e7d32]'
                          : isUpcoming
                          ? 'bg-[#fff3e0] text-[#e65100]'
                          : isCancelled
                          ? 'bg-[#fbe9e7] text-[#d84315]'
                          : 'bg-[#f5f5f5] text-[#757575]'
                      }`}
                    >
                      {course.status} ({course.availableSeats} left)
                    </span>
                  </div>

                  {/* Course Title */}
                  <h4 className="font-serif text-lg text-[#231a15] group-hover:text-[#8c3c0b] transition-colors">
                    {course.title}
                  </h4>

                  {/* Dates */}
                  <p className="text-xs text-[#554339]">
                    {course.fromDate} - {course.toDate}, {course.year}
                  </p>

                  {/* Teacher & Location */}
                  <div className="text-[11px] text-[#887367] flex items-center justify-between pt-1 border-t border-[#f0e4dc]">
                    <span>Teacher: {course.teacher} • {course.location || 'Dungeshwari Hall'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#887367] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Add Batch Modal */}
      <CreateBatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateBatch}
      />
    </div>
  );
};
