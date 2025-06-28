import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ChartData, DepartmentStats, MonthlyPlacement } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

interface ChartsProps {
  departmentStats: DepartmentStats[];
  monthlyPlacements: MonthlyPlacement[];
  companyData: ChartData[];
  packageDistribution: ChartData[];
  statusDistribution: ChartData[];
}

const Charts: React.FC<ChartsProps> = ({
  departmentStats,
  monthlyPlacements,
  companyData,
  packageDistribution,
  statusDistribution,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Department-wise Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department-wise Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="department" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="placed" fill="#10b981" name="Placed" />
            <Bar dataKey="eligible" fill="#f59e0b" name="Eligible" />
            <Bar dataKey="ineligible" fill="#ef4444" name="Ineligible" />
            <Bar dataKey="higherStudies" fill="#8b5cf6" name="Higher Studies" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Student Status Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Placement Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Placement Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyPlacements}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="placed" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Companies */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recruiting Companies</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={companyData.slice(0, 8)} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Package Distribution */}
      <div className="card lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={packageDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;