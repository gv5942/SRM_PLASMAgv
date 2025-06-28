import React from 'react';
import { Users, TrendingUp, Building, Award, UserCheck, UserX, GraduationCap, BookOpen } from 'lucide-react';
import { KPIData } from '../types';

interface KPICardsProps {
  data: KPIData;
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'Total Students',
      value: data.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Placed Students',
      value: data.totalPlaced.toLocaleString(),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Eligible Students',
      value: data.totalEligible.toLocaleString(),
      icon: GraduationCap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Higher Studies',
      value: data.higherStudies.toLocaleString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Ineligible Students',
      value: data.totalIneligible.toLocaleString(),
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Average Package',
      value: `₹${data.averagePackage} LPA`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Top Company',
      value: data.topCompany || 'N/A',
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Highest Package',
      value: `₹${data.topPackage} LPA`,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="card hover:shadow-md transition-shadow duration-200 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;