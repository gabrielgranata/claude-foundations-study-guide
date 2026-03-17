import { useState } from 'react';
import { useAppState } from './hooks/useAppState.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { StudyDomain } from './components/StudyDomain.jsx';
import { ScenarioDeepDive } from './components/ScenarioDeepDive.jsx';
import { AntiPatternDrills } from './components/AntiPatternDrills.jsx';
import { QuickReview } from './components/QuickReview.jsx';
import { LearnCenter } from './components/LearnCenter.jsx';
import { Curriculum } from './components/Curriculum.jsx';
import { PracticeExam } from './components/PracticeExam.jsx';
import { ApiKeyModal } from './components/ApiKeyModal.jsx';

export default function App() {
  const { state, dispatch } = useAppState();
  const [view, setView] = useState('curriculum');   // start on Curriculum, not Dashboard
  const [viewParams, setViewParams] = useState({});
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  function navigate(newView, params = {}) {
    setView(newView);
    setViewParams(params);
  }

  function handleApiKeySave(key) {
    dispatch({ type: 'SET_API_KEY', key: key || null });
    setShowApiKeyModal(false);
  }

  function handleRequestApiKey() {
    setShowApiKeyModal(true);
  }

  const viewProps = {
    state,
    dispatch,
    navigate,
    params: viewParams,
    onRequestApiKey: handleRequestApiKey,
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentView={view}
        navigate={navigate}
        state={state}
        onApiKeyClick={() => setShowApiKeyModal(true)}
      />

      <main className="app-main">
        {view === 'dashboard'    && <Dashboard      {...viewProps} />}
        {view === 'curriculum'   && <Curriculum     {...viewProps} />}
        {view === 'learn'        && <LearnCenter    {...viewProps} key={viewParams?.highlightDomain} />}
        {view === 'study'        && <StudyDomain    {...viewProps} key={JSON.stringify(viewParams)} />}
        {view === 'scenario'     && <ScenarioDeepDive {...viewProps} key={JSON.stringify(viewParams)} />}
        {view === 'antipattern'  && <AntiPatternDrills {...viewProps} key={JSON.stringify(viewParams)} />}
        {view === 'exam'         && <PracticeExam   {...viewProps} key={JSON.stringify(viewParams)} />}
        {view === 'review'       && <QuickReview    {...viewProps} />}
      </main>

      {showApiKeyModal && (
        <ApiKeyModal
          existingKey={state.apiKey}
          onSave={handleApiKeySave}
          onClose={() => setShowApiKeyModal(false)}
        />
      )}
    </div>
  );
}
