import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import DetailPage from './pages/DetailPage';
import AIGenerateScenario from './pages/AIGenerateScenario';
import AIGradeAssessment from './pages/AIGradeAssessment';
import AIAdaptivePath from './pages/AIAdaptivePath';
import AIPerformancePrediction from './pages/AIPerformancePrediction';
import AIIncidentSimulation from './pages/AIIncidentSimulation';
import AISkillGap from './pages/AISkillGap';
import AIScenarioRandomization from './pages/AIScenarioRandomization';
import Layout from './components/Layout';
import Toast from './components/Toast';
import './styles/index.css';
// === Batch 08 Gaps & Frontend Mounts ===
import CfAdaptiveLearningPathsAdjustingScenarioDifficultyBy from './pages/CfAdaptiveLearningPathsAdjustingScenarioDifficultyBy'
import CfScenarioRandomizationGeneratingTrainingVariationsFromDomain from './pages/CfScenarioRandomizationGeneratingTrainingVariationsFromDomain'
import CfPerformancePredictionForecastingCertificationPassFail from './pages/CfPerformancePredictionForecastingCertificationPassFail'
import CfSkillGapIdentificationWithTargetedRemediation from './pages/CfSkillGapIdentificationWithTargetedRemediation'
import CfRealWorldIncidentSimulationGeneratedFromIncident from './pages/CfRealWorldIncidentSimulationGeneratedFromIncident'
import CfScormXapiExportForEnterpriseLmsIntegration from './pages/CfScormXapiExportForEnterpriseLmsIntegration'
import GapNoAdaptiveDifficultyPersonalizedLearningPaths from './pages/GapNoAdaptiveDifficultyPersonalizedLearningPaths'
import GapNoPerformancePrediction from './pages/GapNoPerformancePrediction'
import GapNoScenarioAutoGenerationFromIncidentData from './pages/GapNoScenarioAutoGenerationFromIncidentData'
import GapNoNativeVrPlatformIntegrationUnityUnreal from './pages/GapNoNativeVrPlatformIntegrationUnityUnreal'
import GapNoInstructorDashboardWithStudentProgressViews from './pages/GapNoInstructorDashboardWithStudentProgressViews'
import GapNoCompletionCertificatePdfGeneration from './pages/GapNoCompletionCertificatePdfGeneration'
import GapNoMultiLanguageSupport from './pages/GapNoMultiLanguageSupport'
import GapNoWebhooks from './pages/GapNoWebhooks'
import GapNoPaymentSubscriptionIntegrationForB2bSales from './pages/GapNoPaymentSubscriptionIntegrationForB2bSales'
import GapNoScormXapiLmsExport from './pages/GapNoScormXapiLmsExport'
import CustomViewsPage from './pages/CustomViewsPage'

function ProtectedRoute({ children }) {
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} addToast={addToast} />
        <Toast toasts={toasts} />
      </>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard addToast={addToast} />} />
          <Route path="/feature/:featureKey" element={<FeaturePage addToast={addToast} />} />
          <Route path="/feature/:featureKey/:id" element={<DetailPage addToast={addToast} />} />
          <Route path="/ai/generate-scenario" element={<AIGenerateScenario addToast={addToast} />} />
          <Route path="/ai/grade-assessment" element={<AIGradeAssessment addToast={addToast} />} />
          <Route path="/ai/adaptive-path" element={<AIAdaptivePath addToast={addToast} />} />
          <Route path="/ai/performance-prediction" element={<AIPerformancePrediction addToast={addToast} />} />
          <Route path="/ai/incident-simulation" element={<AIIncidentSimulation addToast={addToast} />} />
          <Route path="/ai/skill-gap" element={<AISkillGap addToast={addToast} />} />
          <Route path="/ai/scenario-randomization" element={<AIScenarioRandomization addToast={addToast} />} />
          {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-adaptive-learning-paths-adjusting-scenario-difficulty-by-performance" element={<ProtectedRoute><CfAdaptiveLearningPathsAdjustingScenarioDifficultyBy /></ProtectedRoute>} />
      <Route path="/cf-scenario-randomization-generating-training-variations-from-domain-rules" element={<ProtectedRoute><CfScenarioRandomizationGeneratingTrainingVariationsFromDomain /></ProtectedRoute>} />
      <Route path="/cf-performance-prediction-forecasting-certification-pass-fail" element={<ProtectedRoute><CfPerformancePredictionForecastingCertificationPassFail /></ProtectedRoute>} />
      <Route path="/cf-skill-gap-identification-with-targeted-remediation" element={<ProtectedRoute><CfSkillGapIdentificationWithTargetedRemediation /></ProtectedRoute>} />
      <Route path="/cf-real-world-incident-simulation-generated-from-incident-reports" element={<ProtectedRoute><CfRealWorldIncidentSimulationGeneratedFromIncident /></ProtectedRoute>} />
      <Route path="/cf-scorm-xapi-export-for-enterprise-lms-integration" element={<ProtectedRoute><CfScormXapiExportForEnterpriseLmsIntegration /></ProtectedRoute>} />
      <Route path="/gap-no-adaptive-difficulty-personalized-learning-paths" element={<ProtectedRoute><GapNoAdaptiveDifficultyPersonalizedLearningPaths /></ProtectedRoute>} />
      <Route path="/gap-no-performance-prediction" element={<ProtectedRoute><GapNoPerformancePrediction /></ProtectedRoute>} />
      <Route path="/gap-no-scenario-auto-generation-from-incident-data" element={<ProtectedRoute><GapNoScenarioAutoGenerationFromIncidentData /></ProtectedRoute>} />
      <Route path="/gap-no-native-vr-platform-integration-unity-unreal-webxr" element={<ProtectedRoute><GapNoNativeVrPlatformIntegrationUnityUnreal /></ProtectedRoute>} />
      <Route path="/gap-no-instructor-dashboard-with-student-progress-views" element={<ProtectedRoute><GapNoInstructorDashboardWithStudentProgressViews /></ProtectedRoute>} />
      <Route path="/gap-no-completion-certificate-pdf-generation" element={<ProtectedRoute><GapNoCompletionCertificatePdfGeneration /></ProtectedRoute>} />
      <Route path="/gap-no-multi-language-support" element={<ProtectedRoute><GapNoMultiLanguageSupport /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks" element={<ProtectedRoute><GapNoWebhooks /></ProtectedRoute>} />
      <Route path="/gap-no-payment-subscription-integration-for-b2b-sales" element={<ProtectedRoute><GapNoPaymentSubscriptionIntegrationForB2bSales /></ProtectedRoute>} />
      <Route path="/gap-no-scorm-xapi-lms-export" element={<ProtectedRoute><GapNoScormXapiLmsExport /></ProtectedRoute>} />
      <Route path="/custom-views" element={<CustomViewsPage />} />
      <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <Toast toasts={toasts} />
    </Router>
  );
}

export default App;
