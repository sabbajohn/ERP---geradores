import React from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaBolt, FaShieldAlt, FaTools, FaFileContract } from "react-icons/fa";
import { Button } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("role");
    localStorage.removeItem("fullname");
    navigate("/login");
  };

  const stats = [
    { title: "Geradores Vendidos", value: "156", Icon: FaBolt, color: "blue" },
    { title: "Garantias a Vencer", value: "8", Icon: FaShieldAlt, color: "yellow" },
    { title: "Manutenções Realizadas", value: "342", Icon: FaTools, color: "green" },
    { title: "Contratos Ativos", value: "89", Icon: FaFileContract, color: "purple" },
  ];

  const maintenanceList = [
    {
      client: "Cliente 1",
      generator: "Gerador #1001",
      date: "23/03/2024",
      type: "Preventiva",
    },
    {
      client: "Cliente 2",
      generator: "Gerador #1002",
      date: "23/03/2024",
      type: "Preventiva",
    },
  ];

  const warrantyList = [
    {
      client: "Cliente 1",
      generator: "Gerador #2001",
      date: "15/04/2024",
      daysRemaining: "30 dias restantes",
    },
    {
      client: "Cliente 2",
      generator: "Gerador #2002",
      date: "15/04/2024",
      daysRemaining: "30 dias restantes",
    },
  ];

  const chartData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        label: "Vendas",
        data: [4, 3, 5, 6, 4, 7],
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
      },
      {
        label: "Manutenções",
        data: [6, 4, 8, 5, 7, 9],
        borderColor: "#059669",
        backgroundColor: "#059669",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ position: "absolute", top: 20, right: 20 }}
        >
          Logout
        </Button>
      </div>

      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <div className="value">{stat.value}</div>
            </div>
            <div className={`stat-icon ${stat.color}`}>
              <stat.Icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="chart-container">
        <h2 className="chart-title">Desempenho Mensal</h2>
        <div style={{ height: "300px" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="list-container">
        <div className="list-card">
          <h2>Próximas Manutenções</h2>
          {maintenanceList.map((item, index) => (
            <div key={index} className="list-item">
              <div className="item-info">
                <h3>{item.client}</h3>
                <p>{item.generator}</p>
              </div>
              <div className="item-status status-preventive">{item.type}</div>
            </div>
          ))}
        </div>

        <div className="list-card">
          <h2>Garantias a Vencer</h2>
          {warrantyList.map((item, index) => (
            <div key={index} className="list-item">
              <div className="item-info">
                <h3>{item.client}</h3>
                <p>{item.generator}</p>
              </div>
              <div className="item-status days-remaining">{item.daysRemaining}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
