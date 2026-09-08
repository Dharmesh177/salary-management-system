import Loader from '../../components/Loader.jsx';
import DashboardChartPanel from '../../features/dashboard/components/DashboardChartPanel.jsx';
import DashboardFxNotice from '../../features/dashboard/components/DashboardFxNotice.jsx';
import DashboardKpiCards from '../../features/dashboard/components/DashboardKpiCards.jsx';
import { useDashboardAnalytics } from '../../features/dashboard/hooks/useDashboardAnalytics.js';
import { DASHBOARD_MESSAGES } from '../../features/dashboard/messages.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const { analytics, loading, error } = useDashboardAnalytics();

  return (
    <section className="dashboard-page">
      <DashboardFxNotice />

      <header className="page-header page-hero">
        <div>
          <h1>{DASHBOARD_MESSAGES.title}</h1>
          <p>{DASHBOARD_MESSAGES.subtitle}</p>
        </div>
      </header>

      {loading ? <Loader message={DASHBOARD_MESSAGES.loading} /> : null}
      {!loading && error ? <p className="status-message error">{error}</p> : null}

      {!loading && !error && analytics ? (
        <>
          <DashboardKpiCards kpis={analytics.kpis} />
          <div className="dashboard-panels">
            {analytics.chartSections.map((section) => (
              <DashboardChartPanel key={section.id} section={section} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
