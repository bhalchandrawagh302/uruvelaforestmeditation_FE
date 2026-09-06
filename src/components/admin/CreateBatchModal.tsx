import React, { useState } from 'react';
import { X, Layers, Calendar, User, MapPin, Users, Globe, FileText, Check } from 'lucide-react';
import { CreateCoursePayload } from '../../services/api';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCoursePayload) => Promise<void>;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('10-Day Meditation Retreat');
  const [year, setYear] = useState(2026);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [teacher, setTeacher] = useState('Senior Sayadaw');
  const [language, setLanguage] = useState('Hindi / English');
  const [location, setLocation] = useState('Dungeshwari Hall');
  const [totalSeats, setTotalSeats] = useState(30);
  const [status, setStatus] = useState<'open' | 'upcoming' | 'cancelled' | 'completed'>('open');
  const [description, setDescription] = useState(
    '10-day intensive residential Vipassana (insight) meditation retreat in noble silence.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates for the retreat.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be later than end date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        year,
        rawStartDate: startDate,
        rawEndDate: endDate,
        teacher,
        language,
        location,
        totalSeats,
        availableSeats: totalSeats,
        status,
        description,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create retreat batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#dbc1b4] shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#f3e7df] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff1eb] flex items-center justify-center text-[#8c3c0b]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#231a15]">
                Add Retreat Batch
              </h3>
              <p className="text-xs text-[#705d53]">Schedule a new 10-day residential course</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#887367] hover:text-[#231a15] p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#231a15]">
          {/* Title & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#3b2e27]">Course Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10-Day Meditation Retreat"
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">Year *</label>
              <input
                type="number"
                required
                min={2026}
                max={2035}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
          </div>

          {/* Teacher & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">Teacher / Sayadaw *</label>
              <input
                type="text"
                required
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Senior Sayadaw"
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">Teaching Language *</label>
              <input
                type="text"
                required
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. Hindi / English"
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
          </div>

          {/* Location & Seats & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">Location / Hall *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dungeshwari Hall"
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">Total Capacity *</label>
              <input
                type="number"
                required
                min={1}
                max={500}
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value, 10))}
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#3b2e27]">Initial Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
              >
                <option value="open">Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-[#3b2e27]">Curriculum / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide retreat instructions and curriculum outline..."
              className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white resize-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-[#f3e7df] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#554339] hover:bg-[#f4ebe3] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#8c3c0b] hover:bg-[#722f07] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Batch...' : 'Create Batch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
