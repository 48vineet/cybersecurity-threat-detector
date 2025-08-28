import { useMemo } from "react";
import { useThreat } from "../../context/ThreatContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const ThreatTimeline = () => {
  const { threats } = useThreat();

  const chartData = useMemo(() => {
    // Group threats by hour for the last 24 hours
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentThreats = threats.filter(
      (threat) => new Date(threat.timestamp) > last24Hours
    );

    // Create hourly buckets
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
      const hour = new Date(last24Hours.getTime() + i * 60 * 60 * 1000);
      const hourKey = hour.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourlyData[hourKey] = {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        blocked: 0,
      };
    }

    // Fill buckets with threat data
    recentThreats.forEach((threat) => {
      const threatHour = new Date(threat.timestamp).toISOString().slice(0, 13);
      if (hourlyData[threatHour]) {
        hourlyData[threatHour].total++;
        hourlyData[threatHour][threat.threatLevel.toLowerCase()]++;
        if (threat.isBlocked) {
          hourlyData[threatHour].blocked++;
        }
      }
    });

    const labels = Object.keys(hourlyData).map((hour) =>
      new Date(hour + ":00:00").toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    return {
      labels,
      datasets: [
        {
          label: "Total Threats",
          data: Object.values(hourlyData).map((d) => d.total),
          borderColor: "rgb(56, 189, 248)",
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Critical Threats",
          data: Object.values(hourlyData).map((d) => d.critical),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "High Threats",
          data: Object.values(hourlyData).map((d) => d.high),
          borderColor: "rgb(251, 146, 60)",
          backgroundColor: "rgba(251, 146, 60, 0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Blocked",
          data: Object.values(hourlyData).map((d) => d.blocked),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
          fill: false,
        },
      ],
    };
  }, [threats]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white",
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Threat Activity Timeline (24 Hours)",
        color: "white",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(56, 189, 248, 0.5)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Time",
          color: "white",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Number of Threats",
          color: "white",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          beginAtZero: true,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ThreatTimeline;
