import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Popup.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
);

const Popup = () => {
  const [wordStats, setWordStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        setError('Failed to access tab');
        return;
      }

      if (!tabs || !tabs[0] || !tabs[0].id) {
        setError('No active tab found');
        return;
      }

      const timeoutId = setTimeout(() => {
        setError('Page took too long to respond. Please refresh and try again.');
      }, 5000);

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'getWordStats' },
        (response) => {
          clearTimeout(timeoutId);
          
          if (chrome.runtime.lastError) {
            setError('Please refresh the page and try again');
            return;
          }
          
          if (!response) {
            setError('No response from page');
            return;
          }

          if (response.error) {
            setError(response.error);
            return;
          }

          if (response.wordStats && response.wordStats.frequencies && response.wordStats.frequencies.length > 0) {
            setWordStats(response.wordStats);
          } else {
            setError('No text found on page');
          }
        }
      );
    });
  }, []);

  // Prepare chart data
  const chartData = {
    labels: wordStats ? Array.from({ length: wordStats.frequencies.length }, (_, i) => i + 1) : [],
    datasets: [
      {
        label: "",
        data: wordStats ? wordStats.frequencies : [],
        words: wordStats ? wordStats.words : [],
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 1.5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'logarithmic',
        title: {
          display: false,
        },
        min: 1,
        ticks: {
          color: '#ffd700',
          font: {
            size: 10,
            family: 'Stratum2'
          },
          callback: function(value) {
            if (Math.log10(value) % 1 === 0) {
              return value;
            }
            return '';
          }
        },
        grid: {
          color: 'rgba(74, 74, 74, 0.3)',
          drawBorder: false
        }
      },
      x: {
        type: 'linear',
        title: {
          display: false,
        },
        min: 1,
        max: 100,
        ticks: {
          color: '#ffd700',
          font: {
            size: 10,
            family: 'Stratum2'
          },
          callback: function(value) {
            if (value % 20 === 0) {
              return value;
            }
            return '';
          }
        },
        grid: {
          color: 'rgba(74, 74, 74, 0.3)',
          drawBorder: false
        }
      }
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: {
          size: 12,
          family: 'Stratum2'
        },
        bodyFont: {
          size: 12,
          family: 'Stratum2'
        },
        borderColor: '#4a4a4a',
        borderWidth: 1,
        padding: 8,
        callbacks: {
          title: () => '',
          label: function(context) {
            const rank = context.parsed.x;
            const frequency = context.parsed.y;
            const word = context.dataset.words[rank - 1];
            return [
              `${word} (${frequency})`
            ];
          }
        }
      }
    }
  };

  const renderTopWords = () => {
    if (!wordStats || !wordStats.words) return null;

    return (
      <div className="top-words">
        <h2>Top 10 Words</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Word</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            {wordStats.words.slice(0, 10).map((word, index) => (
              <tr key={word}>
                <td>{index + 1}</td>
                <td>{word}</td>
                <td>{wordStats.frequencies[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="App-header">
        <div className="title-container">
          <h1>ZiphsLive</h1>
          {wordStats && wordStats.zipfAccuracy && (
            <div className="zipf-accuracy">
              <span className="accuracy-value">{wordStats.zipfAccuracy}%</span>
              <span className="accuracy-label">Zipf</span>
            </div>
          )}
        </div>
        {error ? (
          <div className="error-message">{error}</div>
        ) : wordStats ? (
          <>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
            {renderTopWords()}
          </>
        ) : (
          <p>Loading word statistics...</p>
        )}
      </div>
    </div>
  );
};

export default Popup;
