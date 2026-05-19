import ScenarioLibraryChart from '../components/ScenarioLibraryChart';
import CompetencyHeatmap from '../components/CompetencyHeatmap';
import TrainingCurriculumPDF from '../components/TrainingCurriculumPDF';
import ScenarioRulesEditor from '../components/ScenarioRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <h1>VR Views</h1>
        <p>Custom views for scenario library, competency, curriculum, and rules</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <ScenarioLibraryChart />
        <CompetencyHeatmap />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <TrainingCurriculumPDF />
        <ScenarioRulesEditor />
      </div>
    </div>
  );
}
