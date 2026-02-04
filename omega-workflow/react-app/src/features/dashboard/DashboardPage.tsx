/**
 * DashboardPage Component
 * Main dashboard landing page
 */

import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@components/ui';
import { useAuthStore } from '@stores/authStore';
import {
  DocumentIcon,
  Square3Stack3DIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface QuickActionCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const quickActions: QuickActionCard[] = [
  {
    title: 'Documents',
    description: 'View and manage your uploaded documents',
    icon: DocumentIcon,
    href: '/documents',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Workflows',
    description: 'Create and manage document workflows',
    icon: Square3Stack3DIcon,
    href: '/workflows',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    title: 'Upload',
    description: 'Upload new credit agreements for analysis',
    icon: ArrowUpTrayIcon,
    href: '/upload',
    color: 'text-green-600 bg-green-50',
  },
  {
    title: 'Credit Analysis',
    description: 'AI-powered credit agreement analysis',
    icon: ChartBarIcon,
    href: '/credit-analysis',
    color: 'text-orange-600 bg-orange-50',
  },
];

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your credit analysis workspace
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} to={action.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div
                    className={`inline-flex p-3 rounded-lg ${action.color} mb-4`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent document activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No recent activity. Upload a document to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your workspace overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Documents:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Workflows:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Analyses:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Quick tips to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">1.</span>
                Upload a credit agreement
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">2.</span>
                Create an analysis workflow
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">3.</span>
                Review AI-powered insights
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
