import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, Activity, Clock, TrendingUp, Map, MessageSquare, FileText, Search, Filter, X, Send } from 'lucide-react';

// Mock data
const mockAlerts = [
  { id: 1, severity: 'critical', type: 'Malware', source: '192.168.1.50', target: 'DB-Server-01', time: '2 min ago', status: 'open', description: 'Trojan.GenericKD detected on database server' },
  { id: 2, severity: 'high', type: 'DDoS', source: '203.45.67.89', target: 'Web-Server-03', time: '5 min ago', status: 'investigating', description: 'Unusual traffic spike from external IP' },
  { id: 3, severity: 'medium', type: 'Phishing', source: 'external@fake.com', target: 'user@company.com', time: '12 min ago', status: 'open', description: 'Suspicious email with credential harvesting link' },
  { id: 4, severity: 'critical', type: 'Ransomware', source: '10.0.5.23', target: 'File-Server-05', time: '18 min ago', status: 'open', description: 'File encryption activity detected' },
  { id: 5, severity: 'high', type: 'Brute Force', source: '45.123.67.12', target: 'SSH-Gateway', time: '25 min ago', status: 'resolved', description: 'Multiple failed SSH login attempts' },
  { id: 6, severity: 'medium', type: 'Policy Violation', source: '192.168.2.101', target: 'Internal', time: '30 min ago', status: 'investigating', description: 'Unauthorized USB device detected' }
];

const kpiData = [
  { name: '00:00', alerts: 45, incidents: 12 },
  { name: '04:00', alerts: 52, incidents: 15 },
  { name: '08:00', alerts: 89, incidents: 28 },
  { name: '12:00', alerts: 134, incidents: 42 },
  { name: '16:00', alerts: 98, incidents: 31 },
  { name: '20:00', alerts: 67, incidents: 19 }
];

const threatDistribution = [
  { name: 'Malware', value: 35, color: '#ef4444' },
  { name: 'Phishing', value: 25, color: '#f59e0b' },
  { name: 'DDoS', value: 20, color: '#8b5cf6' },
  { name: 'Brute Force', value: 12, color: '#3b82f6' },
  { name: 'Other', value: 8, color: '#6b7280' }
];

const attackLocations = [
  { lat: 37.7749, lng: -122.4194, city: 'San Francisco', attacks: 234 },
  { lat: 51.5074, lng: -0.1278, city: 'London', attacks: 189 },
  { lat: 35.6762, lng: 139.6503, city: 'Tokyo', attacks: 156 },
  { lat: -33.8688, lng: 151.2093, city: 'Sydney', attacks: 98 },
  { lat: 40.7128, lng: -74.0060, city: 'New York', attacks: 287 }
];

// Main App Component
export default function AegisSOC() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    const newMessages = [...chatMessages, userMessage];
    
    setChatMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }
      
      const data = await response.json();
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Failed to get response: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAI = (alert) => {
    setActiveTab('copilot');
    const query = `Analyze this alert: ${alert.type} - ${alert.description}`;
    setInputMessage(query);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">AegisSOC</h1>
              <p className="text-sm text-gray-400">AI-Powered Security Operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex space-x-1">
          {[
            { id: 'dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'incidents', icon: AlertTriangle, label: 'Incidents' },
            { id: 'map', icon: Map, label: 'Attack Map' },
            { id: 'copilot', icon: MessageSquare, label: 'AI Co-Pilot' },
            { id: 'reports', icon: FileText, label: 'Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPICard title="Active Alerts" value="156" change="+12%" icon={AlertTriangle} color="red" />
              <KPICard title="Open Incidents" value="23" change="-5%" icon={Activity} color="orange" />
              <KPICard title="MTTR" value="18m" change="-15%" icon={Clock} color="green" />
              <KPICard title="Threat Score" value="7.2" change="+0.8" icon={TrendingUp} color="purple" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Alert Trends (24h)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={kpiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Threat Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={threatDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {threatDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>

            {/* Alerts Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Severity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Target</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert, idx) => (
                    <tr key={alert.id} className={`border-t border-gray-700 hover:bg-gray-700/50 ${idx % 2 === 0 ? 'bg-gray-800/50' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{alert.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">{alert.source}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{alert.target}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{alert.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                          alert.status === 'investigating' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleAskAI(alert)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors"
                        >
                          Ask AI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Global Attack Map (Simulated)</h3>
            <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                {/* Simple world outline */}
                <rect width="800" height="400" fill="#0f172a" />
                {attackLocations.map((loc, idx) => (
                  <g key={idx}>
                    <circle
                      cx={(loc.lng + 180) * (800 / 360)}
                      cy={(90 - loc.lat) * (400 / 180)}
                      r="8"
                      fill="#ef4444"
                      opacity="0.7"
                    >
                      <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text
                      x={(loc.lng + 180) * (800 / 360)}
                      y={(90 - loc.lat) * (400 / 180) - 15}
                      fill="#f3f4f6"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {loc.city}: {loc.attacks}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
              {attackLocations.map((loc, idx) => (
                <div key={idx} className="bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-400">{loc.city}</div>
                  <div className="text-xl font-bold text-red-400">{loc.attacks}</div>
                  <div className="text-xs text-gray-500">attacks detected</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    AI Co-Pilot Assistant
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Welcome message - not in state */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-700 text-gray-100">
                      <div className="whitespace-pre-wrap text-sm">
                        Hello! I'm your SOC AI Co-Pilot. I can help you analyze alerts, explain incidents, and generate reports. How can I assist you today?
                      </div>
                    </div>
                  </div>
                  
                  {/* Actual conversation messages */}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about alerts, threats, or request analysis..."
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold mb-3">Quick Commands</h4>
                <div className="space-y-2">
                  {[
                    'Show critical alerts',
                    'Generate summary report',
                    'Analyze malware incidents',
                    'What are the top threats?'
                  ].map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(cmd)}
                      className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">AI-Generated SOC Report</h3>
            <div className="space-y-4 text-sm">
              <section>
                <h4 className="font-semibold text-blue-400 mb-2">Executive Summary</h4>
                <p className="text-gray-300">In the past 24 hours, AegisSOC detected 156 security alerts across the infrastructure. Critical incidents include ransomware activity on File-Server-05 and malware detection on DB-Server-01. Response teams have mitigated 5 high-priority threats with an average MTTR of 18 minutes.</p>
              </section>
              <section>
                <h4 className="font-semibold text-blue-400 mb-2">Threat Landscape</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Malware: 35% of total threats (Trending up 12%)</li>
                  <li>Phishing: 25% of total threats (Stable)</li>
                  <li>DDoS: 20% of total threats (Trending down 5%)</li>
                  <li>Brute Force: 12% (New campaign detected from IP range 45.123.x.x)</li>
                </ul>
              </section>
              <section>
                <h4 className="font-semibold text-blue-400 mb-2">Key Recommendations</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>Deploy endpoint isolation on all servers showing malware indicators</li>
                  <li>Update email gateway rules to block recent phishing campaign patterns</li>
                  <li>Implement rate limiting on public-facing web servers</li>
                  <li>Conduct security awareness training for users targeted by social engineering</li>
                </ol>
              </section>
              <div className="pt-4 border-t border-gray-700">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                  Download Full Report (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KPICard({ title, value, change, icon: Icon, color }) {
  const colorClasses = {
    red: 'text-red-400 bg-red-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
            {change} vs yesterday
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}