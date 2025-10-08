import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const Chart = ({
  type = 'bar',
  data = [],
  width = '100%',
  height = 300,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  ...props
}) => {
  if (type === 'pie') {
    return (
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill={colors[0]} />
          {props.extraBars && props.extraBars.map((bar, index) => (
            <Bar 
              key={bar.dataKey} 
              dataKey={bar.dataKey} 
              fill={colors[(index + 1) % colors.length]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return <div>Unsupported chart type: {type}</div>
}

export default Chart
