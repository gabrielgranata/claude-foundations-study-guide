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

export default function App() {
  const { state, dispatch } = useAppState();
  const [view, setView] = useState('curriculum');
  const [viewParams, setViewParams] = useState({});

  function navigate(newView, params = {}) {
    setView(newView);
    setViewParams(params);
  }

  const viewProps = { state, dispatch, navigate, params: viewParams };

  return (
    <div className="app-layout">
      <Sidebar currentView={view} navigate={navigate} state={state} />

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
    </div>
  );
}
