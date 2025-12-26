import React, { useState, useEffect } from 'react';
import { User, Users, Home, Settings, MessageSquare, Search, Filter, Star, TrendingUp, Clock, Coffee, Book, Sparkles, Moon, Sun, Music, Headphones, Heart, UserCheck, AlertCircle, CheckCircle, XCircle, ChevronRight, ArrowRight, Zap, Award, Target, RefreshCw, Bell, Mail, Phone, MapPin, Calendar, Info } from 'lucide-react';

// Advanced ML Algorithms Implementation
const MLAlgorithms = {
  // Cosine Similarity for preference matching
  cosineSimilarity: (vec1, vec2) => {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
  },

  // Euclidean Distance
  euclideanDistance: (vec1, vec2) => {
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
  },

  // Weighted compatibility score
  calculateCompatibility: (student1, student2, weights) => {
    let score = 0;
    let totalWeight = 0;

    // Sleep schedule compatibility
    const sleepDiff = Math.abs(student1.sleepTime - student2.sleepTime);
    score += (1 - sleepDiff / 12) * weights.sleep;
    totalWeight += weights.sleep;

    // Study habits compatibility
    if (student1.studyHabits === student2.studyHabits) {
      score += weights.study;
    } else if (
      (student1.studyHabits === 'quiet' && student2.studyHabits === 'music') ||
      (student1.studyHabits === 'music' && student2.studyHabits === 'quiet')
    ) {
      score += weights.study * 0.3;
    }
    totalWeight += weights.study;

    // Cleanliness compatibility
    const cleanDiff = Math.abs(student1.cleanliness - student2.cleanliness);
    score += (1 - cleanDiff / 10) * weights.cleanliness;
    totalWeight += weights.cleanliness;

    // Social compatibility
    if (student1.social === student2.social) {
      score += weights.social;
    } else {
      score += weights.social * 0.5;
    }
    totalWeight += weights.social;

    // Interest overlap
    const commonInterests = student1.interests.filter(i => student2.interests.includes(i));
    score += (commonInterests.length / Math.max(student1.interests.length, student2.interests.length)) * weights.interests;
    totalWeight += weights.interests;

    // Language compatibility
    const commonLanguages = student1.languages.filter(l => student2.languages.includes(l));
    score += (commonLanguages.length > 0 ? 1 : 0.3) * weights.languages;
    totalWeight += weights.languages;

    return (score / totalWeight) * 100;
  },

  // K-Means Clustering for grouping similar students
  kMeansClustering: (students, k = 3) => {
    const vectors = students.map(s => [
      s.sleepTime / 24,
      ['quiet', 'music', 'group'].indexOf(s.studyHabits) / 2,
      s.cleanliness / 10,
      s.social === 'introvert' ? 0 : 1,
      s.interests.length / 10
    ]);

    let centroids = vectors.slice(0, k).map(v => [...v]);
    let clusters = new Array(students.length).fill(0);
    let changed = true;
    let iterations = 0;

    while (changed && iterations < 50) {
      changed = false;
      iterations++;

      // Assign to nearest centroid
      for (let i = 0; i < vectors.length; i++) {
        let minDist = Infinity;
        let minCluster = 0;
        
        for (let j = 0; j < k; j++) {
          const dist = MLAlgorithms.euclideanDistance(vectors[i], centroids[j]);
          if (dist < minDist) {
            minDist = dist;
            minCluster = j;
          }
        }
        
        if (clusters[i] !== minCluster) {
          clusters[i] = minCluster;
          changed = true;
        }
      }

      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterPoints = vectors.filter((_, i) => clusters[i] === j);
        if (clusterPoints.length > 0) {
          centroids[j] = centroids[j].map((_, dim) => 
            clusterPoints.reduce((sum, p) => sum + p[dim], 0) / clusterPoints.length
          );
        }
      }
    }

    return clusters;
  },

  // Find best matches using KNN
  findBestMatches: (targetStudent, allStudents, k = 5, weights) => {
    const matches = allStudents
      .filter(s => s.id !== targetStudent.id && s.gender === targetStudent.gender)
      .map(student => ({
        student,
        score: MLAlgorithms.calculateCompatibility(targetStudent, student, weights)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return matches;
  }
};

// Sample data generator
const generateSampleStudents = () => {
  const names = ['Alex Johnson', 'Maria Garcia', 'James Smith', 'Priya Patel', 'Chen Wei', 'Sarah Brown', 'Mohammed Ali', 'Emma Wilson', 'Raj Kumar', 'Lisa Anderson'];
  const interests = ['Reading', 'Sports', 'Music', 'Gaming', 'Cooking', 'Art', 'Hiking', 'Photography', 'Coding', 'Dancing'];
  const languages = ['English', 'Spanish', 'Hindi', 'Mandarin', 'French', 'Arabic', 'Portuguese'];
  const majors = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine', 'Law', 'Sciences'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `STU${String(i + 1).padStart(3, '0')}`,
    name: names[i % names.length] + (i > 9 ? ` ${Math.floor(i / 10)}` : ''),
    email: `student${i + 1}@university.edu`,
    phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    age: 18 + Math.floor(Math.random() * 6),
    gender: i % 2 === 0 ? 'male' : 'female',
    year: Math.floor(Math.random() * 4) + 1,
    major: majors[Math.floor(Math.random() * majors.length)],
    sleepTime: Math.floor(Math.random() * 6) + 22, // 22-27 (10 PM - 3 AM)
    wakeTime: Math.floor(Math.random() * 5) + 6, // 6-10 AM
    studyHabits: ['quiet', 'music', 'group'][Math.floor(Math.random() * 3)],
    cleanliness: Math.floor(Math.random() * 5) + 6, // 6-10
    social: Math.random() > 0.5 ? 'extrovert' : 'introvert',
    interests: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, 
      () => interests[Math.floor(Math.random() * interests.length)]).filter((v, i, a) => a.indexOf(v) === i),
    languages: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
      () => languages[Math.floor(Math.random() * languages.length)]).filter((v, i, a) => a.indexOf(v) === i),
    dietary: ['None', 'Vegetarian', 'Vegan', 'Halal'][Math.floor(Math.random() * 4)],
    smoking: Math.random() > 0.8,
    pets: Math.random() > 0.9,
    roomPreference: ['any', 'single', 'double'][Math.floor(Math.random() * 3)],
    floorPreference: Math.floor(Math.random() * 5) + 1,
    hasRoommate: false,
    roomNumber: null,
    bio: 'Passionate student looking for compatible roommates!',
    profileComplete: true,
    matchScore: 0
  }));
};

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [userType, setUserType] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    year: 'all',
    major: 'all',
    social: 'all'
  });

  const weights = {
    sleep: 0.25,
    study: 0.20,
    cleanliness: 0.20,
    social: 0.15,
    interests: 0.15,
    languages: 0.05
  };

  useEffect(() => {
    const students = generateSampleStudents();
    setAllStudents(students);
  }, []);

  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const findMatches = (student) => {
    const bestMatches = MLAlgorithms.findBestMatches(student, allStudents, 8, weights);
    setMatches(bestMatches);
    return bestMatches;
  };

  const createProfile = (profileData) => {
    const newStudent = {
      ...profileData,
      id: `STU${String(allStudents.length + 1).padStart(3, '0')}`,
      hasRoommate: false,
      roomNumber: null,
      profileComplete: true
    };
    setCurrentStudent(newStudent);
    setAllStudents([...allStudents, newStudent]);
    findMatches(newStudent);
    setCurrentView('dashboard');
    showToast('Profile created successfully! Finding your perfect matches...');
  };

  // Landing Page
  const LandingPage = () => (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <nav className="landing-nav">
          <div className="logo">
            <Home className="logo-icon" />
            <span>RoomieAI</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>AI-Powered Matching</span>
          </div>
          <h1 className="hero-title">
            Find Your Perfect
            <span className="gradient-text"> Roommate</span>
          </h1>
          <p className="hero-subtitle">
            Advanced AI algorithms match you with compatible roommates based on lifestyle, 
            preferences, and personality traits. Say goodbye to roommate conflicts!
          </p>
          
          <div className="hero-cta">
            <button 
              className="btn-primary btn-large"
              onClick={() => {
                setUserType('student');
                setCurrentView('signup');
              }}
            >
              <User size={20} />
              Get Started as Student
              <ArrowRight size={20} />
            </button>
            <button 
              className="btn-secondary btn-large"
              onClick={() => {
                setUserType('admin');
                setCurrentView('admin-login');
              }}
            >
              <Settings size={20} />
              Admin Portal
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Students Matched</div>
            </div>
            <div className="stat">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
            <div className="stat">
              <div className="stat-number">50+</div>
              <div className="stat-label">Hostels</div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section" id="features">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          <FeatureCard 
            icon={<Zap />}
            title="AI-Powered Matching"
            description="Advanced machine learning algorithms analyze compatibility across multiple dimensions"
          />
          <FeatureCard 
            icon={<Target />}
            title="Smart Recommendations"
            description="Get personalized roommate suggestions based on your unique preferences"
          />
          <FeatureCard 
            icon={<MessageSquare />}
            title="Integrated Chat"
            description="Connect with potential roommates before making a decision"
          />
          <FeatureCard 
            icon={<Award />}
            title="Compatibility Score"
            description="See detailed compatibility metrics for each potential match"
          />
          <FeatureCard 
            icon={<RefreshCw />}
            title="Easy Room Swaps"
            description="Request room changes and swaps with just a few clicks"
          />
          <FeatureCard 
            icon={<TrendingUp />}
            title="Learning System"
            description="Algorithm improves over time based on successful matches"
          />
        </div>
      </div>

      <div className="how-it-works" id="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <Step 
            number="1"
            title="Create Your Profile"
            description="Tell us about your lifestyle, preferences, and habits"
          />
          <Step 
            number="2"
            title="AI Analysis"
            description="Our algorithm analyzes compatibility with thousands of students"
          />
          <Step 
            number="3"
            title="Review Matches"
            description="Browse your top matches with detailed compatibility scores"
          />
          <Step 
            number="4"
            title="Connect & Move In"
            description="Chat with matches and get assigned to your perfect room"
          />
        </div>
      </div>
    </div>
  );

  const FeatureCard = ({ icon, title, description }) => (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  const Step = ({ number, title, description }) => (
    <div className="step">
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  // Signup Form
  const SignupForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      age: 18,
      gender: 'male',
      year: 1,
      major: '',
      sleepTime: 23,
      wakeTime: 7,
      studyHabits: 'quiet',
      cleanliness: 8,
      social: 'introvert',
      interests: [],
      languages: ['English'],
      dietary: 'None',
      smoking: false,
      pets: false,
      roomPreference: 'double',
      floorPreference: 1,
      bio: ''
    });

    const interests = ['Reading', 'Sports', 'Music', 'Gaming', 'Cooking', 'Art', 'Hiking', 'Photography', 'Coding', 'Dancing', 'Yoga', 'Movies'];
    const languages = ['English', 'Spanish', 'Hindi', 'Mandarin', 'French', 'Arabic', 'Portuguese', 'German', 'Japanese'];

    const toggleInterest = (interest) => {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.includes(interest)
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      }));
    };

    const toggleLanguage = (language) => {
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.includes(language)
          ? prev.languages.filter(l => l !== language)
          : [...prev.languages, language]
      }));
    };

    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <button className="back-btn" onClick={() => setCurrentView('landing')}>
              ← Back
            </button>
            <h2>Create Your Profile</h2>
            <div className="step-indicator">
              Step {step} of 3
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          {step === 1 && (
            <div className="form-step">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@university.edu"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-555-0000"
                  />
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    min="17"
                    max="30"
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === 'male'}
                        onChange={() => setFormData({ ...formData, gender: 'male' })}
                      />
                      <span>Male</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === 'female'}
                        onChange={() => setFormData({ ...formData, gender: 'female' })}
                      />
                      <span>Female</span>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Academic Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  >
                    <option value={1}>First Year</option>
                    <option value={2}>Second Year</option>
                    <option value={3}>Third Year</option>
                    <option value={4}>Fourth Year</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Major *</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>
              </div>
              <button className="btn-primary btn-block" onClick={() => setStep(2)}>
                Continue <ChevronRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3>Lifestyle & Preferences</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Sleep Time</label>
                  <div className="time-input">
                    <Moon size={18} />
                    <input
                      type="range"
                      min="20"
                      max="28"
                      value={formData.sleepTime}
                      onChange={(e) => setFormData({ ...formData, sleepTime: parseInt(e.target.value) })}
                    />
                    <span>{formData.sleepTime > 24 ? formData.sleepTime - 24 : formData.sleepTime}:00 {formData.sleepTime >= 24 ? 'AM' : 'PM'}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Wake Time</label>
                  <div className="time-input">
                    <Sun size={18} />
                    <input
                      type="range"
                      min="5"
                      max="12"
                      value={formData.wakeTime}
                      onChange={(e) => setFormData({ ...formData, wakeTime: parseInt(e.target.value) })}
                    />
                    <span>{formData.wakeTime}:00 AM</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Study Habits</label>
                  <select
                    value={formData.studyHabits}
                    onChange={(e) => setFormData({ ...formData, studyHabits: e.target.value })}
                  >
                    <option value="quiet">Quiet Environment</option>
                    <option value="music">With Music</option>
                    <option value="group">Group Study</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cleanliness Level</label>
                  <div className="slider-input">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.cleanliness}
                      onChange={(e) => setFormData({ ...formData, cleanliness: parseInt(e.target.value) })}
                    />
                    <span>{formData.cleanliness}/10</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Social Preference</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="social"
                        checked={formData.social === 'introvert'}
                        onChange={() => setFormData({ ...formData, social: 'introvert' })}
                      />
                      <span>Introvert</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="social"
                        checked={formData.social === 'extrovert'}
                        onChange={() => setFormData({ ...formData, social: 'extrovert' })}
                      />
                      <span>Extrovert</span>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Room Preference</label>
                  <select
                    value={formData.roomPreference}
                    onChange={(e) => setFormData({ ...formData, roomPreference: e.target.value })}
                  >
                    <option value="any">Any</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Dietary Restrictions</label>
                <select
                  value={formData.dietary}
                  onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                >
                  <option value="None">None</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                </select>
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.smoking}
                    onChange={(e) => setFormData({ ...formData, smoking: e.target.checked })}
                  />
                  <span>Smoker</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.pets}
                    onChange={(e) => setFormData({ ...formData, pets: e.target.checked })}
                  />
                  <span>Have Pets</span>
                </label>
              </div>

              <div className="btn-group">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={() => setStep(3)}>
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>Interests & Languages</h3>
              
              <div className="form-group full-width">
                <label>Interests & Hobbies</label>
                <div className="tags-container">
                  {interests.map(interest => (
                    <button
                      key={interest}
                      className={`tag ${formData.interests.includes(interest) ? 'tag-active' : ''}`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Languages</label>
                <div className="tags-container">
                  {languages.map(language => (
                    <button
                      key={language}
                      className={`tag ${formData.languages.includes(language) ? 'tag-active' : ''}`}
                      onClick={() => toggleLanguage(language)}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Bio (Optional)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>

              <div className="btn-group">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => createProfile(formData)}
                >
                  <Sparkles size={20} />
                  Find My Matches
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Student Dashboard
  const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('matches');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);

    const filteredMatches = matches.filter(m => {
      const matchesSearch = m.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           m.student.major.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = filterOptions.year === 'all' || m.student.year === parseInt(filterOptions.year);
      const matchesMajor = filterOptions.major === 'all' || m.student.major === filterOptions.major;
      const matchesSocial = filterOptions.social === 'all' || m.student.social === filterOptions.social;
      return matchesSearch && matchesYear && matchesMajor && matchesSocial;
    });

    return (
      <div className="dashboard">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="dashboard-main">
          <DashboardHeader student={currentStudent} />
          
          {activeTab === 'matches' && (
            <div className="dashboard-content">
              <div className="content-header">
                <div>
                  <h2>Your Top Matches</h2>
                  <p>AI-powered compatibility analysis</p>
                </div>
                <div className="header-actions">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search matches..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn-icon" onClick={() => setFilterOptions({ year: 'all', major: 'all', social: 'all' })}>
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              <div className="filters-bar">
                <select value={filterOptions.year} onChange={(e) => setFilterOptions({...filterOptions, year: e.target.value})}>
                  <option value="all">All Years</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
                <select value={filterOptions.social} onChange={(e) => setFilterOptions({...filterOptions, social: e.target.value})}>
                  <option value="all">All Types</option>
                  <option value="introvert">Introvert</option>
                  <option value="extrovert">Extrovert</option>
                </select>
              </div>

              <div className="matches-grid">
                {filteredMatches.map(({ student, score }) => (
                  <MatchCard 
                    key={student.id}
                    student={student}
                    score={score}
                    onViewProfile={() => setSelectedMatch({ student, score })}
                    onChat={() => {
                      setSelectedMatch({ student, score });
                      setChatOpen(true);
                    }}
                  />
                ))}
              </div>

              {filteredMatches.length === 0 && (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>No matches found</h3>
                  <p>Try adjusting your filters</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileView student={currentStudent} onUpdate={(updated) => setCurrentStudent(updated)} />
          )}

          {activeTab === 'requests' && (
            <RequestsView student={currentStudent} />
          )}

          {activeTab === 'settings' && (
            <SettingsView student={currentStudent} onUpdate={(updated) => setCurrentStudent(updated)} />
          )}
        </div>

        {selectedMatch && (
          <ProfileModal 
            match={selectedMatch}
            onClose={() => {
              setSelectedMatch(null);
              setChatOpen(false);
            }}
            chatOpen={chatOpen}
            onOpenChat={() => setChatOpen(true)}
          />
        )}
      </div>
    );
  };

  const Sidebar = ({ activeTab, setActiveTab }) => (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Home className="logo-icon" />
        <span>RoomieAI</span>
      </div>

      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <Users size={20} />
          <span>My Matches</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <MessageSquare size={20} />
          <span>Requests</span>
          <span className="badge">3</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-text" onClick={() => setCurrentView('landing')}>
          Sign Out
        </button>
      </div>
    </div>
  );

  const DashboardHeader = ({ student }) => (
    <div className="dashboard-header">
      <div>
        <h1>Welcome back, {student?.name.split(' ')[0]}! 👋</h1>
        <p>Here are your personalized roommate recommendations</p>
      </div>
      <div className="header-right">
        <button className="btn-icon notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="user-avatar">
          {student?.name.charAt(0)}
        </div>
      </div>
    </div>
  );

  const MatchCard = ({ student, score, onViewProfile, onChat }) => {
    const getScoreColor = (score) => {
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#3b82f6';
      return '#f59e0b';
    };

    return (
      <div className="match-card">
        <div className="match-score-badge" style={{ background: getScoreColor(score) }}>
          {Math.round(score)}%
        </div>
        
        <div className="match-avatar">
          {student.name.charAt(0)}
        </div>

        <h3>{student.name}</h3>
        <p className="match-major">{student.major}</p>
        
        <div className="match-tags">
          <span className="tag-small">{student.year}th Year</span>
          <span className="tag-small">{student.social}</span>
        </div>

        <div className="match-details">
          <div className="detail-item">
            <Moon size={14} />
            <span>{student.sleepTime > 24 ? student.sleepTime - 24 : student.sleepTime}:00 {student.sleepTime >= 24 ? 'AM' : 'PM'}</span>
          </div>
          <div className="detail-item">
            <Book size={14} />
            <span>{student.studyHabits}</span>
          </div>
        </div>

        <div className="compatibility-bars">
          <div className="compat-item">
            <span>Sleep</span>
            <div className="compat-bar">
              <div className="compat-fill" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="compat-item">
            <span>Study</span>
            <div className="compat-bar">
              <div className="compat-fill" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div className="compat-item">
            <span>Social</span>
            <div className="compat-bar">
              <div className="compat-fill" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>

        <div className="match-actions">
          <button className="btn-secondary btn-sm" onClick={onViewProfile}>
            View Profile
          </button>
          <button className="btn-primary btn-sm" onClick={onChat}>
            <MessageSquare size={16} />
            Chat
          </button>
        </div>
      </div>
    );
  };

  const ProfileModal = ({ match, onClose, chatOpen, onOpenChat }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="profile-modal-header">
          <div className="profile-avatar-large">
            {match.student.name.charAt(0)}
          </div>
          <div className="profile-header-info">
            <h2>{match.student.name}</h2>
            <p>{match.student.major} • {match.student.year}th Year</p>
            <div className="compatibility-score-large">
              <Star size={20} fill="currentColor" />
              <span>{Math.round(match.score)}% Compatible</span>
            </div>
          </div>
        </div>

        <div className="profile-modal-body">
          {!chatOpen ? (
            <>
              <div className="profile-section">
                <h3><Info size={18} /> About</h3>
                <p>{match.student.bio}</p>
              </div>

              <div className="profile-section">
                <h3><Clock size={18} /> Schedule</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Moon size={16} />
                    <div>
                      <span className="info-label">Sleep Time</span>
                      <span className="info-value">{match.student.sleepTime > 24 ? match.student.sleepTime - 24 : match.student.sleepTime}:00 {match.student.sleepTime >= 24 ? 'AM' : 'PM'}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <Sun size={16} />
                    <div>
                      <span className="info-label">Wake Time</span>
                      <span className="info-value">{match.student.wakeTime}:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3><Book size={18} /> Study Preferences</h3>
                <div className="tags-display">
                  <span className="tag">{match.student.studyHabits}</span>
                  <span className="tag">Cleanliness: {match.student.cleanliness}/10</span>
                  <span className="tag">{match.student.social}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3><Heart size={18} /> Interests</h3>
                <div className="tags-display">
                  {match.student.interests.map(interest => (
                    <span key={interest} className="tag">{interest}</span>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3><Coffee size={18} /> Additional Info</h3>
                <div className="tags-display">
                  {match.student.languages.map(lang => (
                    <span key={lang} className="tag">{lang}</span>
                  ))}
                  <span className="tag">{match.student.dietary}</span>
                  {match.student.smoking && <span className="tag">Smoker</span>}
                  {match.student.pets && <span className="tag">Has Pets</span>}
                </div>
              </div>

              <div className="profile-modal-actions">
                <button className="btn-secondary btn-large" onClick={onClose}>
                  Close
                </button>
                <button className="btn-primary btn-large" onClick={onOpenChat}>
                  <MessageSquare size={20} />
                  Start Chat
                </button>
              </div>
            </>
          ) : (
            <ChatInterface student={match.student} onBack={() => onOpenChat()} />
          )}
        </div>
      </div>
    </div>
  );

  const ChatInterface = ({ student }) => {
    const [messages, setMessages] = useState([
      { id: 1, sender: 'them', text: `Hey! I'm ${student.name.split(' ')[0]}. I noticed we have a ${Math.round(85 + Math.random() * 10)}% compatibility match! 😊`, time: '10:30 AM' },
      { id: 2, sender: 'me', text: 'Hi! Yes, I saw that too! Your profile looks great', time: '10:32 AM' },
      { id: 3, sender: 'them', text: `Thanks! I see we both enjoy ${student.interests[0] || 'similar activities'}. What year are you in?`, time: '10:33 AM' },
      { id: 4, sender: 'me', text: `I'm in ${currentStudent?.year}th year studying ${currentStudent?.major}`, time: '10:35 AM' },
      { id: 5, sender: 'them', text: `Cool! I'm studying ${student.major}. Our sleep schedules seem pretty compatible too - I usually sleep around ${student.sleepTime > 24 ? student.sleepTime - 24 : student.sleepTime}:00 ${student.sleepTime >= 24 ? 'AM' : 'PM'}`, time: '10:37 AM' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // AI Response Generator
    const generateAIResponse = (userMessage) => {
      const lowerMessage = userMessage.toLowerCase();
      
      // Context-aware responses
      const responses = {
        greeting: [
          `Hey! Nice to hear from you! 👋`,
          `Hi there! How's it going?`,
          `Hello! Great to connect with you!`
        ],
        study: [
          `I usually study in ${student.studyHabits === 'quiet' ? 'quiet environments' : student.studyHabits === 'music' ? 'with some background music' : 'groups'}. How about you?`,
          `I'm pretty flexible with study times. I find ${student.studyHabits} study sessions work best for me.`,
          `Since I'm in ${student.major}, I have to study quite a bit. What's your study routine like?`
        ],
        sleep: [
          `I'm definitely a ${student.sleepTime >= 24 ? 'night owl' : 'early sleeper'} - usually hit the bed around ${student.sleepTime > 24 ? student.sleepTime - 24 : student.sleepTime}:00 ${student.sleepTime >= 24 ? 'AM' : 'PM'}`,
          `I wake up around ${student.wakeTime}:00 AM usually. Are you an early bird or night owl?`,
          `Sleep schedule is important to me! I try to keep a consistent routine.`
        ],
        hobbies: [
          `I love ${student.interests[0] || 'hanging out'}! We should definitely ${student.interests[1] ? 'try ' + student.interests[1].toLowerCase() : 'do something'} together sometime.`,
          `I'm really into ${student.interests.slice(0, 2).join(' and ').toLowerCase()}. What do you like to do in your free time?`,
          `On weekends I usually enjoy ${student.interests[Math.floor(Math.random() * student.interests.length)]?.toLowerCase() || 'relaxing'}.`
        ],
        room: [
          `I prefer a ${student.cleanliness >= 8 ? 'clean and organized' : 'comfortable and lived-in'} space. How about you?`,
          `I'm pretty ${student.social === 'introvert' ? 'quiet and need my personal space' : 'social and love having people over'}. Hope that works for you!`,
          `I think we'd get along great as roommates based on our compatibility score!`
        ],
        meet: [
          `That sounds perfect! How about we grab coffee at the campus café sometime this week?`,
          `I'd love to! Maybe we could meet at the student center? I'm free most afternoons.`,
          `Great idea! When works best for you? I'm pretty flexible.`
        ],
        positive: [
          `Absolutely! I think we'd make great roommates! 😊`,
          `That's awesome! I'm really excited about this!`,
          `Yes! This is working out perfectly!`
        ],
        question: [
          `That's a great question! Let me think... ${student.social === 'extrovert' ? 'I love social activities and meeting new people!' : 'I value quiet time but also enjoy good company!'}`,
          `Good point! I'm pretty ${student.cleanliness >= 7 ? 'organized' : 'flexible'} about that.`,
          `I'd say ${student.interests[0] || 'staying active'} is really important to me.`
        ],
        default: [
          `That's interesting! Tell me more about that.`,
          `I see what you mean! ${student.interests[0] ? 'I also enjoy ' + student.interests[0].toLowerCase() : 'We have a lot in common'}.`,
          `Sounds good to me! What else would you like to know about me?`,
          `I agree! Communication is key for good roommates.`,
          `Definitely! I think our compatibility score shows we'd get along well.`
        ]
      };

      // Pattern matching for intelligent responses
      if (lowerMessage.match(/\b(hi|hey|hello|sup|yo)\b/)) {
        return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
      } else if (lowerMessage.match(/\b(study|studying|exam|homework|library|class)\b/)) {
        return responses.study[Math.floor(Math.random() * responses.study.length)];
      } else if (lowerMessage.match(/\b(sleep|wake|morning|night|early|late)\b/)) {
        return responses.sleep[Math.floor(Math.random() * responses.sleep.length)];
      } else if (lowerMessage.match(/\b(hobby|hobbies|free time|weekend|fun|interest)\b/)) {
        return responses.hobbies[Math.floor(Math.random() * responses.hobbies.length)];
      } else if (lowerMessage.match(/\b(room|clean|messy|organize|space|living)\b/)) {
        return responses.room[Math.floor(Math.random() * responses.room.length)];
      } else if (lowerMessage.match(/\b(meet|coffee|hangout|hang out|get together)\b/)) {
        return responses.meet[Math.floor(Math.random() * responses.meet.length)];
      } else if (lowerMessage.match(/\b(great|awesome|perfect|cool|nice|love|like|yes|yeah)\b/)) {
        return responses.positive[Math.floor(Math.random() * responses.positive.length)];
      } else if (lowerMessage.includes('?')) {
        return responses.question[Math.floor(Math.random() * responses.question.length)];
      } else {
        return responses.default[Math.floor(Math.random() * responses.default.length)];
      }
    };

    const sendMessage = () => {
      if (newMessage.trim()) {
        const userMsg = {
          id: messages.length + 1,
          sender: 'me',
          text: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages([...messages, userMsg]);
        setNewMessage('');
        setIsTyping(true);
        
        // Simulate realistic typing delay (1-3 seconds)
        const typingDelay = 1000 + Math.random() * 2000;
        
        setTimeout(() => {
          setIsTyping(false);
          const aiResponse = generateAIResponse(userMsg.text);
          
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            sender: 'them',
            text: aiResponse,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }, typingDelay);
      }
    };

    return (
      <div className="chat-interface">
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar">{student.name.charAt(0)}</div>
            <div>
              <h4>{student.name}</h4>
              <span className="online-status">● Online</span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender === 'me' ? 'message-sent' : 'message-received'}`}>
              <div className="message-bubble">
                <p>{msg.text}</p>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message message-received">
              <div className="message-bubble typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="message-time">typing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button className="btn-primary" onClick={sendMessage} disabled={!newMessage.trim()}>
            Send
          </button>
        </div>
      </div>
    );
  };

  const ProfileView = ({ student, onUpdate }) => (
    <div className="profile-view">
      <div className="profile-card">
        <div className="profile-header-large">
          <div className="profile-avatar-xl">
            {student?.name.charAt(0)}
          </div>
          <div>
            <h2>{student?.name}</h2>
            <p>{student?.email}</p>
            <p>{student?.phone}</p>
          </div>
          <button className="btn-secondary">Edit Profile</button>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <Target size={24} />
            <div>
              <div className="stat-number">{matches.length}</div>
              <div className="stat-label">Total Matches</div>
            </div>
          </div>
          <div className="stat-card">
            <Award size={24} />
            <div>
              <div className="stat-number">{matches.filter(m => m.score >= 80).length}</div>
              <div className="stat-label">Great Matches</div>
            </div>
          </div>
          <div className="stat-card">
            <MessageSquare size={24} />
            <div>
              <div className="stat-number">5</div>
              <div className="stat-label">Active Chats</div>
            </div>
          </div>
        </div>

        <div className="profile-details-grid">
          <DetailSection title="Academic Information">
            <DetailItem label="Year" value={`${student?.year}th Year`} />
            <DetailItem label="Major" value={student?.major} />
            <DetailItem label="Student ID" value={student?.id} />
          </DetailSection>

          <DetailSection title="Lifestyle">
            <DetailItem label="Sleep Schedule" value={`${student?.sleepTime > 24 ? student?.sleepTime - 24 : student?.sleepTime}:00 ${student?.sleepTime >= 24 ? 'AM' : 'PM'} - ${student?.wakeTime}:00 AM`} />
            <DetailItem label="Study Habits" value={student?.studyHabits} />
            <DetailItem label="Cleanliness" value={`${student?.cleanliness}/10`} />
            <DetailItem label="Social Type" value={student?.social} />
          </DetailSection>

          <DetailSection title="Preferences">
            <DetailItem label="Room Type" value={student?.roomPreference} />
            <DetailItem label="Floor Preference" value={`Floor ${student?.floorPreference}`} />
            <DetailItem label="Dietary" value={student?.dietary} />
          </DetailSection>
        </div>

        <DetailSection title="Interests & Hobbies">
          <div className="tags-display">
            {student?.interests.map(interest => (
              <span key={interest} className="tag">{interest}</span>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="Languages">
          <div className="tags-display">
            {student?.languages.map(lang => (
              <span key={lang} className="tag">{lang}</span>
            ))}
          </div>
        </DetailSection>
      </div>
    </div>
  );

  const DetailSection = ({ title, children }) => (
    <div className="detail-section">
      <h3>{title}</h3>
      <div className="detail-content">{children}</div>
    </div>
  );

  const DetailItem = ({ label, value }) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );

  const RequestsView = () => {
    const requests = [
      { id: 1, name: 'Sarah Johnson', type: 'roommate', status: 'pending', score: 87 },
      { id: 2, name: 'Mike Chen', type: 'swap', status: 'pending', score: 92 },
      { id: 3, name: 'Emma Wilson', type: 'roommate', status: 'accepted', score: 78 }
    ];

    return (
      <div className="requests-view">
        <h2>Room Requests</h2>
        <div className="requests-list">
          {requests.map(req => (
            <div key={req.id} className="request-card">
              <div className="request-avatar">{req.name.charAt(0)}</div>
              <div className="request-info">
                <h4>{req.name}</h4>
                <p>{req.type === 'roommate' ? 'Roommate Request' : 'Room Swap Request'} • {req.score}% Match</p>
              </div>
              {req.status === 'pending' ? (
                <div className="request-actions">
                  <button className="btn-icon-success">
                    <CheckCircle size={20} />
                  </button>
                  <button className="btn-icon-danger">
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <span className="status-badge status-accepted">Accepted</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SettingsView = ({ student }) => (
    <div className="settings-view">
      <h2>Settings</h2>
      <div className="settings-sections">
        <div className="settings-card">
          <h3>Notification Preferences</h3>
          <div className="settings-options">
            <SettingToggle label="Email Notifications" />
            <SettingToggle label="Match Alerts" />
            <SettingToggle label="Chat Messages" />
            <SettingToggle label="Room Assignment Updates" />
          </div>
        </div>

        <div className="settings-card">
          <h3>Privacy</h3>
          <div className="settings-options">
            <SettingToggle label="Show Profile to Others" />
            <SettingToggle label="Allow Messages from Matches" />
            <SettingToggle label="Visible in Search" />
          </div>
        </div>

        <div className="settings-card">
          <h3>Matching Preferences</h3>
          <button className="btn-secondary">Update Preferences</button>
          <button className="btn-primary" style={{ marginTop: '10px' }}>
            <RefreshCw size={18} />
            Refresh Matches
          </button>
        </div>
      </div>
    </div>
  );

  const SettingToggle = ({ label }) => {
    const [enabled, setEnabled] = useState(true);
    return (
      <div className="setting-toggle">
        <span>{label}</span>
        <button 
          className={`toggle-btn ${enabled ? 'toggle-on' : 'toggle-off'}`}
          onClick={() => setEnabled(!enabled)}
        >
          <div className="toggle-slider"></div>
        </button>
      </div>
    );
  };

  // Notification Toast
  const NotificationToast = ({ message, show }) => (
    <div className={`notification-toast ${show ? 'show' : ''}`}>
      <CheckCircle size={20} />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="app">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'signup' && <SignupForm />}
      {currentView === 'dashboard' && <StudentDashboard />}
      <NotificationToast message={notificationMessage} show={showNotification} />
      
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #0f0f1e;
          color: #e2e8f0;
        }

        .app {
          min-height: 100vh;
          position: relative;
        }

        /* Landing Page Styles */
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
        }

        .landing-hero {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 2rem;
        }

        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
          animation: float 20s infinite;
        }

        .shape-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 350px;
          height: 350px;
          background: linear-gradient(45deg, #ec4899, #f43f5e);
          top: 50%;
          right: -150px;
          animation-delay: 5s;
        }

        .shape-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #3b82f6, #06b6d4);
          bottom: -150px;
          left: 30%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(50px, -50px) rotate(120deg); }
          66% { transform: translate(-30px, 30px) rotate(240deg); }
        }

        .landing-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .logo-icon {
          color: #6366f1;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links a {
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: #fff;
        }

        .hero-content {
          max-width: 900px;
          margin: 8rem auto 0;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 50px;
          color: #a5b4fc;
          font-size: 0.875rem;
          margin-bottom: 2rem;
          animation: slideDown 0.6s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          line-height: 1.8;
          max-width: 700px;
          margin: 0 auto 3rem;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .btn-primary, .btn-secondary {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .btn-large {
          padding: 1.25rem 2.5rem;
          font-size: 1.125rem;
        }

        .hero-stats {
          display: flex;
          gap: 4rem;
          justify-content: center;
          margin-top: 5rem;
          animation: fadeInUp 0.8s ease-out 0.8s both;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .features-section {
          padding: 8rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 4rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-5px);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: #94a3b8;
          line-height: 1.6;
        }

        .how-it-works {
          padding: 8rem 2rem;
          background: rgba(255, 255, 255, 0.02);
        }

        .steps-container {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 3rem;
        }

        .step {
          text-align: center;
          position: relative;
        }

        .step-number {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 1.5rem;
        }

        .step h3 {
          font-size: 1.125rem;
          margin-bottom: 0.75rem;
        }

        .step p {
          color: #94a3b8;
          line-height: 1.6;
        }

        /* Signup Form Styles */
        .signup-container {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          max-width: 700px;
          width: 100%;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .signup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .back-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem;
          transition: color 0.3s;
        }

        .back-btn:hover {
          color: #fff;
        }

        .signup-header h2 {
          font-size: 1.75rem;
        }

        .step-indicator {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
          transition: width 0.3s ease;
        }

        .form-step {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .form-step h3 {
          font-size: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          color: #cbd5e1;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.875rem;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #6366f1;
          background: rgba(255, 255, 255, 0.08);
        }

        .radio-group {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.3s;
        }

        .radio-label:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .radio-label input[type="radio"] {
          accent-color: #6366f1;
        }

        .time-input,
        .slider-input {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .time-input input[type="range"],
        .slider-input input[type="range"] {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0;
        }

        input[type="range"] {
          -webkit-appearance: none;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .tag {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.875rem;
        }

        .tag:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(99, 102, 241, 0.5);
        }

        .tag-active {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-color: transparent;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .checkbox-label input[type="checkbox"] {
          accent-color: #6366f1;
          width: 18px;
          height: 18px;
        }

        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .btn-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-block {
          width: 100%;
          margin-top: 2rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        /* Dashboard Styles */
        .dashboard {
          display: flex;
          min-height: 100vh;
          background: #0f0f1e;
        }

        .sidebar {
          width: 280px;
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 2rem;
          margin-bottom: 3rem;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 1rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
          text-align: left;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          color: #fff;
        }

        .nav-item .badge {
          margin-left: auto;
          background: #ef4444;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .sidebar-footer {
          padding: 0 2rem;
        }

        .btn-text {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.3s;
        }

        .btn-text:hover {
          color: #fff;
        }

        .dashboard-main {
          flex: 1;
          overflow-y: auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .dashboard-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .dashboard-header p {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #fff;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .notification-btn {
          position: relative;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.125rem;
        }

        .dashboard-content {
          padding: 2rem;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .content-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .content-header p {
          color: #94a3b8;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          min-width: 300px;
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          outline: none;
        }

        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .filters-bar select {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filters-bar select:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .match-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          transition: all 0.3s;
          animation: slideInUp 0.5s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .match-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .match-score-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .match-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 auto 1rem;
        }

        .match-card h3 {
          text-align: center;
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }

        .match-major {
          text-align: center;
          color: #94a3b8;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .match-tags {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .tag-small {
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .match-details {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .compatibility-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .compat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .compat-item span {
          min-width: 50px;
        }

        .compat-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .compat-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .match-actions {
          display: flex;
          gap: 0.75rem;
        }

        .match-actions button {
          flex: 1;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }

        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: #1a1a2e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideInUp 0.3s ease-out;
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          z-index: 10;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(90deg);
        }

        .profile-modal-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .profile-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .profile-header-info h2 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }

        .profile-header-info p {
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .compatibility-score-large {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 20px;
          color: white;
          font-weight: 600;
        }

        .profile-modal-body {
          padding: 2rem;
        }

        .profile-section {
          margin-bottom: 2rem;
        }

        .profile-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          margin-bottom: 1rem;
          color: #cbd5e1;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .info-item > div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .info-value {
          color: #fff;
          font-weight: 600;
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .profile-modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-modal-actions button {
          flex: 1;
        }

        /* Chat Interface */
        .chat-interface {
          display: flex;
          flex-direction: column;
          height: 500px;
        }

        .chat-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .chat-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .chat-user-info h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .online-status {
          color: #10b981;
          font-size: 0.75rem;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-sent {
          justify-content: flex-end;
        }

        .message-received {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          padding: 0.875rem 1.125rem;
          border-radius: 16px;
        }

        .message-sent .message-bubble {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        }

        .message-received .message-bubble {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .message-bubble p {
          margin-bottom: 0.25rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .chat-input {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 1rem;
        }

        .chat-input input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.875rem;
          color: #fff;
        }

        .chat-input input:focus {
          outline: none;
          border-color: #6366f1;
        }

        .chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Typing Indicator */
        .typing-indicator {
          padding: 0.875rem 1.125rem !important;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          margin-bottom: 0.5rem;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: typing-bounce 1.4s infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        /* Profile View */
        .profile-view {
          padding: 2rem;
        }

        .profile-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .profile-header-large {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-avatar-xl {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
        }

        .profile-header-large > div:nth-child(2) {
          flex: 1;
        }

        .profile-header-large h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .profile-header-large p {
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .stat-card svg {
          color: #6366f1;
        }

        .profile-details-grid {
          display: grid;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .detail-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .detail-section h3 {
          font-size: 1.125rem;
          margin-bottom: 1rem;
          color: #cbd5e1;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #94a3b8;
        }

        .detail-value {
          color: #fff;
          font-weight: 600;
        }

        /* Requests View */
        .requests-view {
          padding: 2rem;
        }

        .requests-view h2 {
          font-size: 1.75rem;
          margin-bottom: 2rem;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .request-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .request-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(5px);
        }

        .request-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .request-info {
          flex: 1;
        }

        .request-info h4 {
          font-size: 1.125rem;
          margin-bottom: 0.25rem;
        }

        .request-info p {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon-success,
        .btn-icon-danger {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-icon-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .btn-icon-success:hover {
          background: rgba(16, 185, 129, 0.3);
          transform: scale(1.1);
        }

        .btn-icon-danger {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .btn-icon-danger:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: scale(1.1);
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-accepted {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        /* Settings View */
        .settings-view {
          padding: 2rem;
        }

        .settings-view h2 {
          font-size: 1.75rem;
          margin-bottom: 2rem;
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
        }

        .settings-card h3 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .settings-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .setting-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .toggle-btn {
          width: 52px;
          height: 28px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.3s;
        }

        .toggle-on {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        }

        .toggle-off {
          background: rgba(255, 255, 255, 0.1);
        }

        .toggle-slider {
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          transition: all 0.3s;
        }

        .toggle-on .toggle-slider {
          left: 27px;
        }

        .toggle-off .toggle-slider {
          left: 3px;
        }

        /* Notification Toast */
        .notification-toast {
          position: fixed;
          bottom: -100px;
          right: 2rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 2000;
          font-weight: 600;
        }

        .notification-toast.show {
          bottom: 2rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .sidebar {
            width: 240px;
          }

          .hero-title {
            font-size: 3rem;
          }

          .matches-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -280px;
            transition: left 0.3s;
            z-index: 1000;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .steps-container {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .nav-links {
            display: none;
          }

          .search-box {
            min-width: auto;
            width: 100%;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .content-header {
            flex-direction: column;
            gap: 1rem;
          }

          .matches-grid {
            grid-template-columns: 1fr;
          }

          .profile-header-large {
            flex-direction: column;
            text-align: center;
          }

          .profile-stats {
            grid-template-columns: 1fr;
          }

          .hero-cta {
            flex-direction: column;
          }

          .btn-large {
            width: 100%;
          }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Loading Animation */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Hover Effects and Transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-duration: 0.3s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        button {
          user-select: none;
        }

        button:active {
          transform: scale(0.95);
        }

        /* Focus Styles */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }

        /* Selection Styling */
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        /* Backdrop Blur Support */
        @supports (backdrop-filter: blur(10px)) {
          .dashboard-header {
            backdrop-filter: blur(10px);
          }

          .modal-overlay {
            backdrop-filter: blur(4px);
          }
        }

        /* Advanced Animations */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton {
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.03) 25%, 
            rgba(255, 255, 255, 0.08) 50%, 
            rgba(255, 255, 255, 0.03) 75%
          );
          background-size: 2000px 100%;
          animation: shimmer 2s infinite;
        }

        /* Glass Morphism Effect */
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Gradient Borders */
        .gradient-border {
          position: relative;
          border: 1px solid transparent;
          background-clip: padding-box;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: -1;
          margin: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        /* Smooth Scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Utility Classes */
        .text-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Print Styles */
        @media print {
          .sidebar,
          .dashboard-header,
          .btn-primary,
          .btn-secondary,
          .floating-shapes {
            display: none;
          }

          .dashboard-main {
            margin: 0;
          }

          .match-card {
            break-inside: avoid;
          }
        }

        /* Dark Mode Enhancements */
        @media (prefers-color-scheme: dark) {
          body {
            color-scheme: dark;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .btn-primary,
          .btn-secondary {
            border-width: 2px;
          }

          .match-card,
          .feature-card {
            border-width: 2px;
          }
        }

        /* Accessibility Improvements */
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Interactive Elements */
        .interactive {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .interactive:hover {
          transform: translateY(-2px);
        }

        .interactive:active {
          transform: translateY(0);
        }

        /* Card Hover Effects */
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .card-3d:hover {
          transform: perspective(1000px) rotateY(5deg);
        }

        /* Gradient Animations */
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animated-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }

        /* Particle Effect */
        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }

        /* Status Indicators */
        .status-online::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-right: 0.5rem;
          animation: pulse 2s infinite;
        }

        /* Tooltip Styles */
        .tooltip {
          position: relative;
        }

        .tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 8px;
          font-size: 0.875rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s, transform 0.3s;
        }

        .tooltip:hover::after {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }

        /* Loading States */
        .loading {
          position: relative;
          pointer-events: none;
          opacity: 0.6;
        }

        .loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Success/Error States */
        .success {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }

        /* Micro-interactions */
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(0.9); }
          20%, 40% { transform: scale(1.1); }
        }

        .heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        /* Professional Polish */
        .premium-card {
          position: relative;
          overflow: hidden;
        }

        .premium-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.03),
            transparent
          );
          transform: rotate(45deg);
          transition: all 0.5s;
        }

        .premium-card:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  );
};

export default App;