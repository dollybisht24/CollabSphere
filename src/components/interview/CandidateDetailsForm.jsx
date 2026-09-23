import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, GraduationCap, Briefcase, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, AlertCircle, Code, Layers, Database, Cpu
} from 'lucide-react';

const roleIcons = {
  'Frontend Developer': Code,
  'Full Stack Developer': Layers,
  'MERN Stack Developer': Database,
  'AI/ML Developer': Cpu
};

const classYearPresets = [
  'BCA 1st Year',
  'BCA 2nd Year',
  'BCA 3rd Year',
  'B.Tech CSE 3rd Year',
  'B.Tech CSE Final Year',
  'MCA 1st Year',
  'MCA Final Year',
  'B.Sc Computer Science'
];

const availableRoles = [
  {
    id: 'Frontend Developer',
    name: 'Frontend Developer',
    desc: 'React, JavaScript, CSS, HTML5, Browser APIs, Web Performance'
  },
  {
    id: 'Full Stack Developer',
    name: 'Full Stack Developer',
    desc: 'Frontend, Node.js, Express, REST APIs, Database Architecture, Auth'
  },
  {
    id: 'MERN Stack Developer',
    name: 'MERN Stack Developer',
    desc: 'MongoDB, Express.js, React.js, Node.js, Aggregations, JWT'
  },
  {
    id: 'AI/ML Developer',
    name: 'AI/ML Developer',
    desc: 'Python, Machine Learning, Deep Learning, GenAI, LLMs, Vector DBs'
  }
];

const CandidateDetailsForm = ({
  initialData = {},
  isLoggedIn = false,
  onProceed
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    classYear: initialData.classYear || '',
    role: initialData.role || 'Frontend Developer'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) return 'Please enter your full name.';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
        return '';
      case 'email':
        if (!value || !value.trim()) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return '';
      case 'classYear':
        if (!value || !value.trim()) return 'Please select or enter your class/year.';
        if (value.trim().length < 2) return 'Class/Year must be at least 2 characters.';
        return '';
      case 'role':
        if (!value) return 'Please select an interview role.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const handleSelectPreset = (preset) => {
    handleChange('classYear', preset);
    setTouched(prev => ({ ...prev, classYear: true }));
    setErrors(prev => ({ ...prev, classYear: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const classYearErr = validateField('classYear', formData.classYear);
    const roleErr = validateField('role', formData.role);

    const newErrors = {
      name: nameErr,
      email: emailErr,
      classYear: classYearErr,
      role: roleErr
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, classYear: true, role: true });

    if (nameErr || emailErr || classYearErr || roleErr) {
      return;
    }

    onProceed({
      name: formData.name.trim(),
      email: formData.email.trim(),
      classYear: formData.classYear.trim(),
      role: formData.role
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="max-w-3xl mx-auto space-y-8"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Header Banner */}
      <div className="rounded-3xl border border-black/10 bg-black text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[.18em] text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Candidate Information
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Set Up Your Candidate Profile
          </h1>
          <p className="text-sm text-white/70 max-w-xl leading-relaxed">
            Enter your academic details below. These will be verified and officially recorded on your post-interview <strong>Feedback Report</strong> and <strong>Certificate of Completion</strong>.
          </p>

          {isLoggedIn && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white/90">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Synced from your CollabSphere account. You can edit any field before proceeding.</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-black/10 bg-white p-6 sm:p-10 shadow-sm space-y-8">
        {/* Field 1: Full Name */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. Dolly Bisht"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                errors.name
                  ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400/20'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Field 2: Email Address */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="e.g. dolly@example.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                errors.email
                  ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400/20'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10'
              }`}
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              Used for candidate identification. Protected by our privacy boundary—never shown publicly on verification links.
            </p>
          )}
        </div>

        {/* Field 3: Class / Year */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Class / Year of Study <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.classYear}
              onChange={(e) => handleChange('classYear', e.target.value)}
              onBlur={() => handleBlur('classYear')}
              placeholder="e.g. BCA 3rd Year or B.Tech CSE Final Year"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                errors.classYear
                  ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400/20'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10'
              }`}
            />
          </div>

          {/* Quick Preset Chips */}
          <div className="pt-1">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
              Quick presets (click to select):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {classYearPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    formData.classYear === preset
                      ? 'bg-black text-white border-black font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {errors.classYear && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.classYear}</span>
            </p>
          )}
        </div>

        {/* Field 4: Interview Role Selection */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Target Interview Role <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-500">Select one role</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableRoles.map((r) => {
              const IconComponent = roleIcons[r.name] || Briefcase;
              const isSelected = formData.role === r.name;
              return (
                <div
                  key={r.id}
                  onClick={() => handleChange('role', r.name)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'border-black bg-neutral-50/80 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {r.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black text-white shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.role}</span>
            </p>
          )}
        </div>

        {/* Security / Privacy Trust Badge */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-950 leading-relaxed">
            <strong>CollabSphere Privacy Commitment:</strong> Your academic record and full name will be encoded in your certificate with a unique verifiable ID. Email and private response transcripts are never made public.
          </div>
        </div>

        {/* Proceed Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-all shadow-md shadow-black/10 flex items-center justify-center gap-2 group"
          >
            <span>Continue to Interview Setup</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CandidateDetailsForm;
