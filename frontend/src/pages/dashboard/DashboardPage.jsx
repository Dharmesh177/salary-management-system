import Loader from '../../components/Loader.jsx';
import DashboardChartPanel, { formatUsd } from '../../features/dashboard/components/DashboardChartPanel.jsx';
import DashboardKpiCards from '../../features/dashboard/components/DashboardKpiCards.jsx';
import { useDashboardAnalytics } from '../../features/dashboard/hooks/useDashboardAnalytics.js';
import { DASHBOARD_MESSAGES } from '../../features/dashboard/messages.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const { analytics, loading, error } = useDashboardAnalytics();

  return (
    <section className="dashboard-page">
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
            <DashboardChartPanel
              title={DASHBOARD_MESSAGES.employeeDistributionByCountry}
              rows={analytics.employeeDistributionByCountry}
              labelKey="countryName"
              valueKey="employeeCount"
            />
            <DashboardChartPanel
              title={DASHBOARD_MESSAGES.employeeDistributionByDepartment}
              rows={analytics.employeeDistributionByDepartment}
              labelKey="departmentName"
              valueKey="employeeCount"
            />
            <DashboardChartPanel
              title={DASHBOARD_MESSAGES.averageCompensationByCountry}
              rows={analytics.averageCompensationByCountry}
              labelKey="countryName"
              valueKey="averageCompensationUsd"
              formatValue={formatUsd}
            />
            <DashboardChartPanel
              title={DASHBOARD_MESSAGES.averageCompensationByDepartment}
              rows={analytics.averageCompensationByDepartment}
              labelKey="departmentName"
              valueKey="averageCompensationUsd"
              formatValue={formatUsd}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
