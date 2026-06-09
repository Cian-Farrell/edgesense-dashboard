import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:8084/api/readings";

function App() {
  const [readings, setReadings] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  const fetchReadings = async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data.map((r, index) => ({
        id: r.id,
        temp: r.temp,
        humidity: r.humidity,
        anomaly: r.anomaly,
        time: index + 1
      }));
      setReadings(data);
      setAnomalies(data.filter(r => r.anomaly));
    } catch (error) {
      console.error("Error fetching readings:", error);
    }
  };

  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>EdgeSense Dashboard</h1>
      <h2>Live Sensor Readings</h2>

      <h3>Temperature (°C)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={readings}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: "Reading", position: "insideBottom" }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temp" stroke="#ff7300" name="Temperature  °C" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <h3>Humidity (%)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={readings}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: "Reading", position: "insideBottom" }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="humidity" stroke="#0088fe" name="Humidity (%)" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <h3>Anomalies Detected: {anomalies.length}</h3>
      {anomalies.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.temp}</td>
                <td>{a.humidity}</td>
                <td>{a.timeStamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No anomalies detected.</p>
      )}
    </div>
  );
}

export default App;