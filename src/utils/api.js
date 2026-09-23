export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const getAuthToken = () => localStorage.getItem('edupro_token');

const clearStoredAuth = () => {
  localStorage.removeItem('edupro_token');
  localStorage.removeItem('edupro_user');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : { error: await response.text() };
  
  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }

    let errorMessage = 'An error occurred';
    if (data.errors && Array.isArray(data.errors)) {
      errorMessage = data.errors.map(err => err.msg).join(', ');
    } else {
      const error = data.error?.message || data.error || data.message || 'An error occurred';
      errorMessage = typeof error === 'string' ? error : 'An error occurred';
    }

    const err = new Error(errorMessage);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  
  return data;
};

const request = async (url, options) => {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the server. Please try again.');
    }
    throw error;
  }
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...authHeaders(),
});

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return request(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (name, email, password, confirmPassword) => {
    return request(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  },

  logout: async () => {
    return request(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (data) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/user/profile/avatar`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },
};

export const projectsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/projects`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  get: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  addMember: async (id, email) => {
    const response = await fetch(`${API_URL}/projects/${id}/members`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  uploadFile: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/projects/${id}/files`, { method: 'POST', headers: authHeaders(), body: formData });
    return handleResponse(response);
  },

  getFiles: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/files`, { headers: authHeaders() });
    return handleResponse(response);
  },

  getFileContent: async (id, fileId) => {
    const response = await fetch(`${API_URL}/projects/${id}/files/${fileId}/content`, { headers: authHeaders() });
    if (!response.ok) return handleResponse(response);
    return response.blob();
  },

  explainFile: async (id, fileId) => {
    const response = await fetch(`${API_URL}/projects/${id}/files/${fileId}/explain`, { method: 'POST', headers: authHeaders() });
    return handleResponse(response);
  },

  deleteFile: async (id, fileId) => {
    const response = await fetch(`${API_URL}/projects/${id}/files/${fileId}`, { method: 'DELETE', headers: authHeaders() });
    return handleResponse(response);
  },

  getMembers: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/members`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  updateMemberRole: async (id, userId, role) => {
    const response = await fetch(`${API_URL}/projects/${id}/members/${userId}/role`, {
      method: 'PATCH',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  removeMember: async (id, userId) => {
    const response = await fetch(`${API_URL}/projects/${id}/members/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  leave: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/leave`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getNotes: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/notes`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getNote: async (id, noteId) => {
    const response = await fetch(`${API_URL}/projects/${id}/notes/${noteId}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  createNote: async (id, data) => {
    const response = await fetch(`${API_URL}/projects/${id}/notes`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateNote: async (id, noteId, data) => {
    const response = await fetch(`${API_URL}/projects/${id}/notes/${noteId}`, {
      method: 'PATCH',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteNote: async (id, noteId) => {
    const response = await fetch(`${API_URL}/projects/${id}/notes/${noteId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getAnalytics: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/analytics`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getPublic: async (slug) => {
    const response = await fetch(`${API_URL}/projects/public/${slug}/view`);
    return handleResponse(response);
  },

  importProject: async (data) => {
    let headers = authHeaders();
    let body;

    if (data instanceof FormData) {
      body = data;
    } else {
      headers = jsonAuthHeaders();
      body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}/projects/import`, {
      method: 'POST',
      headers,
      body
    });
    return handleResponse(response);
  },

  analyze: async (id, analysisType = 'full') => {
    const response = await fetch(`${API_URL}/projects/${id}/analyze`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ analysisType })
    });
    return handleResponse(response);
  },

  analyzeProject: async (id, analysisType = 'full') => {
    const response = await fetch(`${API_URL}/projects/${id}/analyze`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ analysisType })
    });
    return handleResponse(response);
  },

  getAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/analysis`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getLatestAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/analysis`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getAnalysisHistory: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/analysis/history`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  reanalyze: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/reanalyze`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  reanalyzeProject: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/reanalyze`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  reviewCode: async (id, data) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/review-code`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getIdeas: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/ideas`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  generateFeatureIdeas: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/ideas`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getImplementationPlan: async (id, data) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/implementation-plan`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  askChat: async (id, message, conversationHistory = []) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/chat`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ message, conversationHistory })
    });
    return handleResponse(response);
  },

  askAi: async (id, message, conversationHistory = []) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/chat`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ message, conversationHistory })
    });
    return handleResponse(response);
  },

  getResumeBullets: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/resume-bullets`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getUiReview: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/ui-review`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getVisualIdeas: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/visual-ideas`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  saveVisualConcept: async (id, visualData) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/visuals/save`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(visualData)
    });
    return handleResponse(response);
  },

  updateVisualStatus: async (id, visualId, status) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/visuals/${visualId}`, {
      method: 'PATCH',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  getReviewHistory: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/ai/history`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getRoadmap: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}/roadmap`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  addRoadmapTask: async (id, taskData) => {
    const response = await fetch(`${API_URL}/projects/${id}/roadmap`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(response);
  },

  updateRoadmapTask: async (id, taskId, updateData) => {
    const response = await fetch(`${API_URL}/projects/${id}/roadmap/${taskId}`, {
      method: 'PATCH',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  deleteRoadmapTask: async (id, taskId) => {
    const response = await fetch(`${API_URL}/projects/${id}/roadmap/${taskId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },
};

export const geminiAPI = {
  chat: async (message, conversationId, projectId, attachmentId) => {
    const response = await fetch(`${API_URL}/gemini/chat`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ message, conversationId, projectId, attachmentId }),
    });
    return handleResponse(response);
  },

  uploadAttachment: async (file, conversationId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) formData.append('conversationId', conversationId);
    const response = await fetch(`${API_URL}/gemini/attachments`, { method: 'POST', headers: authHeaders(), body: formData });
    return handleResponse(response);
  },

  getConversations: async () => {
    const response = await fetch(`${API_URL}/gemini/conversations`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getConversation: async (id) => {
    const response = await fetch(`${API_URL}/gemini/conversations/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  deleteConversation: async (id) => {
    const response = await fetch(`${API_URL}/gemini/conversations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  explain: async (text) => {
    const response = await fetch(`${API_URL}/gemini/explain`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  docs: async (text) => {
    const response = await fetch(`${API_URL}/gemini/docs`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  improve: async (text) => {
    const response = await fetch(`${API_URL}/gemini/improve`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  readme: async (text) => {
    const response = await fetch(`${API_URL}/gemini/readme`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },
};

// Courses API
export const coursesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  create: async (courseData) => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },

  update: async (id, courseData) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(courseData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/courses/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  create: async (taskData) => {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  update: async (id, taskData) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  toggle: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/tasks/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Analytics API
export const analyticsAPI = {
  getAll: async (startDate, endDate) => {
    let url = `${API_URL}/analytics`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  create: async (analyticsData) => {
    const response = await fetch(`${API_URL}/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(analyticsData),
    });
    return handleResponse(response);
  },

  getSummary: async () => {
    const response = await fetch(`${API_URL}/analytics/summary`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Interview Practice API
export const interviewAPI = {
  start: async ({ role, difficulty, interviewType, totalQuestions, projectContext, candidateName, candidateEmail, candidateClassYear, candidate }) => {
    const response = await fetch(`${API_URL}/interview/start`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ role, difficulty, interviewType, totalQuestions, projectContext, candidateName, candidateEmail, candidateClassYear, candidate })
    });
    return handleResponse(response);
  },

  evaluate: async ({ sessionId, questionNumber, userAnswer, isSkipped }) => {
    const response = await fetch(`${API_URL}/interview/evaluate`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ sessionId, questionNumber, userAnswer, isSkipped })
    });
    return handleResponse(response);
  },

  nextQuestion: async (sessionId) => {
    const response = await fetch(`${API_URL}/interview/question`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ sessionId })
    });
    return handleResponse(response);
  },

  complete: async (sessionId, candidateDetails) => {
    const payload = typeof candidateDetails === 'string'
      ? { sessionId, candidateName: candidateDetails }
      : { sessionId, ...candidateDetails };
    const response = await fetch(`${API_URL}/interview/complete`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  finalAnalysis: async (sessionId, candidateDetails) => {
    const payload = typeof candidateDetails === 'string'
      ? { sessionId, candidateName: candidateDetails }
      : { sessionId, ...candidateDetails };
    const response = await fetch(`${API_URL}/interview/final-analysis`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  getProgress: async () => {
    const response = await fetch(`${API_URL}/interview/progress`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getImprovementPlan: async (sessionId) => {
    const response = await fetch(`${API_URL}/interview/improvement-plan`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ sessionId })
    });
    return handleResponse(response);
  },

  getHistory: async () => {
    const response = await fetch(`${API_URL}/interview/history`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getResult: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}/result`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getReport: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}/report`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getCertificate: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}/certificate`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  verifyCertificate: async (certificateId) => {
    const response = await fetch(`${API_URL}/certificate/${encodeURIComponent(certificateId)}/verify`);
    return handleResponse(response);
  }
};

// Certificate API
export const englishAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/english/profile`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  saveProfile: async (data) => {
    const response = await fetch(`${API_URL}/english/profile`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getDashboard: async () => {
    const response = await fetch(`${API_URL}/english/dashboard`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  submitAssessment: async (data) => {
    const response = await fetch(`${API_URL}/english/assessment`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  startVoiceSession: async ({ mode, topic, level, persona, voiceName }) => {
    const response = await fetch(`${API_URL}/english/voice/start`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ mode, topic, level, persona, voiceName })
    });
    return handleResponse(response);
  },

  sendVoiceTurn: async ({ sessionId, message, mode, topic, level, persona, voiceName }) => {
    const response = await fetch(`${API_URL}/english/voice/turn`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ sessionId, message, mode, topic, level, persona, voiceName })
    });
    return handleResponse(response);
  },

  sendVoiceTurnAudio: async (formData) => {
    // Note: Do NOT set Content-Type header so browser sets multipart/form-data with boundary
    const headers = authHeaders();
    delete headers['Content-Type'];
    const response = await fetch(`${API_URL}/english/voice/turn`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(response);
  },

  endVoiceSession: async ({ sessionId, durationSeconds }) => {
    const response = await fetch(`${API_URL}/english/voice/end`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ sessionId, durationSeconds })
    });
    return handleResponse(response);
  },

  getDailyQuiz: async () => {
    const response = await fetch(`${API_URL}/english/daily-quiz`, {
      method: 'POST',
      headers: jsonAuthHeaders()
    });
    return handleResponse(response);
  },

  submitDailyQuiz: async (answers) => {
    const response = await fetch(`${API_URL}/english/daily-quiz/submit`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ answers })
    });
    return handleResponse(response);
  },

  completeJourneyStep: async (stepId) => {
    const response = await fetch(`${API_URL}/english/journey/complete-step`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ stepId })
    });
    return handleResponse(response);
  },

  submitFinalAssessment: async (data) => {
    const response = await fetch(`${API_URL}/english/final-assessment`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getSessions: async () => {
    const response = await fetch(`${API_URL}/english/sessions`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getDailyPlan: async () => {
    const response = await fetch(`${API_URL}/english/daily-plan`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  toggleDailyPlanTask: async (taskKey) => {
    const response = await fetch(`${API_URL}/english/daily-plan/toggle`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ taskKey })
    });
    return handleResponse(response);
  },

  getStories: async (level = '') => {
    const response = await fetch(`${API_URL}/english/stories${level ? `?level=${encodeURIComponent(level)}` : ''}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  submitStoryQuiz: async (data) => {
    const response = await fetch(`${API_URL}/english/stories/submit-quiz`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  explainStoryScene: async ({ storyId, sceneNumber, language = 'en' }) => {
    const response = await fetch(`${API_URL}/english/stories/explain-scene`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ storyId, sceneNumber, language })
    });
    return handleResponse(response);
  },

  getCartoons: async (filterOrLevel = '') => {
    let queryStr = '';
    if (typeof filterOrLevel === 'string') {
      if (filterOrLevel) queryStr = `?level=${encodeURIComponent(filterOrLevel)}`;
    } else if (filterOrLevel && typeof filterOrLevel === 'object') {
      const sp = new URLSearchParams();
      if (filterOrLevel.level) sp.append('level', filterOrLevel.level);
      if (filterOrLevel.type) sp.append('type', filterOrLevel.type);
      if (filterOrLevel.topic) sp.append('topic', filterOrLevel.topic);
      if (filterOrLevel.duration) sp.append('duration', filterOrLevel.duration);
      if (filterOrLevel.search) sp.append('search', filterOrLevel.search);
      const qs = sp.toString();
      if (qs) queryStr = `?${qs}`;
    }
    const response = await fetch(`${API_URL}/english/cartoons${queryStr}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getCartoonHistory: async () => {
    const response = await fetch(`${API_URL}/english/cartoons/history`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  explainCartoonScene: async (data) => {
    const response = await fetch(`${API_URL}/english/cartoons/explain-scene`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  chatCartoonTutor: async (data) => {
    const response = await fetch(`${API_URL}/english/cartoons/chat-tutor`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // YouTube Discovery & Video Endpoints
  searchYouTube: async (params = {}) => {
    const sp = new URLSearchParams();
    if (params.query || params.q || params.search) sp.append('q', params.query || params.q || params.search);
    if (params.level && params.level !== 'All') sp.append('level', params.level);
    if (params.type && params.type !== 'All') sp.append('type', params.type);
    if (params.topic && params.topic !== 'All') sp.append('topic', params.topic);
    if (params.duration && params.duration !== 'All') sp.append('duration', params.duration);
    if (params.pageToken) sp.append('pageToken', params.pageToken);
    if (params.maxResults) sp.append('maxResults', params.maxResults);

    const qs = sp.toString();
    const response = await fetch(`${API_URL}/youtube/search${qs ? `?${qs}` : ''}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getYouTubeVideo: async (videoId) => {
    const response = await fetch(`${API_URL}/youtube/video/${encodeURIComponent(videoId)}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getRecommendedYouTube: async () => {
    const response = await fetch(`${API_URL}/youtube/recommended`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  getFeaturedYouTube: async (level = '') => {
    const response = await fetch(`${API_URL}/youtube/featured${level ? `?level=${encodeURIComponent(level)}` : ''}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // AI Cartoon Teaching & Evaluation Endpoints
  analyzeCartoonAI: async (data) => {
    const response = await fetch(`${API_URL}/ai/cartoon/analyze`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  explainCartoonContext: async (data) => {
    const response = await fetch(`${API_URL}/ai/cartoon/explain`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  chatCartoonTeacher: async (data) => {
    const response = await fetch(`${API_URL}/ai/cartoon/teacher`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  synthesizeCartoonVoice: async (data) => {
    const response = await fetch(`${API_URL}/ai/cartoon/tts`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  submitCartoonQuiz: async (data) => {
    const response = await fetch(`${API_URL}/english/cartoons/submit-quiz`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getVocabulary: async (level = '') => {
    const response = await fetch(`${API_URL}/english/vocabulary${level ? `?level=${encodeURIComponent(level)}` : ''}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  recordVocabularyAction: async (data) => {
    const response = await fetch(`${API_URL}/english/vocabulary/action`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getWritingPrompts: async (level = '') => {
    const response = await fetch(`${API_URL}/english/writing/prompts${level ? `?level=${encodeURIComponent(level)}` : ''}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  evaluateWriting: async (data) => {
    const response = await fetch(`${API_URL}/english/writing/evaluate`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  chatWithTutor: async (data) => {
    const response = await fetch(`${API_URL}/english/tutor/chat`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // Journey & Placement Diagnostic
  getPlacementQuestions: async () => {
    const response = await fetch(`${API_URL}/english/placement-assessment/questions`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  evaluatePlacement: async (data) => {
    const response = await fetch(`${API_URL}/english/placement-assessment/evaluate`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getJourneyPhases: async () => {
    const response = await fetch(`${API_URL}/english/journey/phases`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  completeJourneyPhase: async (data) => {
    const response = await fetch(`${API_URL}/english/journey/complete-phase`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getDailyChallenge: async () => {
    const response = await fetch(`${API_URL}/english/daily-challenge`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  submitDailyChallenge: async (data) => {
    const response = await fetch(`${API_URL}/english/daily-challenge/submit`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getSkillsDashboard: async () => {
    const response = await fetch(`${API_URL}/english/skills-dashboard`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  evaluateSpeaking: async (data) => {
    const response = await fetch(`${API_URL}/english/speaking/evaluate`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  evaluateSpeakingAudio: async (formData) => {
    const headers = authHeaders();
    delete headers['Content-Type'];
    const response = await fetch(`${API_URL}/english/speaking/evaluate`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(response);
  },

  getGrammarTopics: async () => {
    const response = await fetch(`${API_URL}/english/grammar/topics`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  submitGrammarPractice: async (data) => {
    const response = await fetch(`${API_URL}/english/grammar/submit`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  completePhaseLesson: async (data) => {
    const response = await fetch(`${API_URL}/english/journey/complete-lesson`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  submitPracticeQuiz: async (data) => {
    const response = await fetch(`${API_URL}/english/quiz/submit-practice`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

export const certificateAPI = {
  verify: async (certificateId) => {
    const response = await fetch(`${API_URL}/certificate/${encodeURIComponent(certificateId)}/verify`);
    return handleResponse(response);
  },
  getById: async (certificateId) => {
    const response = await fetch(`${API_URL}/certificate/${encodeURIComponent(certificateId)}`);
    return handleResponse(response);
  }
};

