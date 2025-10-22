/**
 * GoQii M&A Targets Industry Classification Database
 * 
 * Comprehensive market map for potential acquisition targets
 * in the fitness, wellness, and digital health space.
 */

import { IndustryNode, getGrowthColor } from '@/types/industryMap';

export const goqiiIndustryMap: IndustryNode = {
  id: 'root',
  name: 'M&A Targets for GoQii',
  value: 650000, // $650B total addressable market
  growthRate: 18.5,
  description: 'Total addressable market for strategic acquisition targets in health, wellness, and fitness technology',
  children: [
    {
      id: 'wearables',
      name: 'Wearables & Fitness Tracking',
      value: 82000,
      growthRate: 15.2,
      description: 'Companies developing wearable devices and fitness tracking solutions',
      metadata: {
        region: ['Global'],
        maturity: 'growing',
        competitiveIntensity: 'high',
        keyTrends: ['AI integration', 'Advanced biometrics', 'Sleep tracking'],
        strategicFit: 5
      },
      children: [
        {
          id: 'smart-wearables',
          name: 'Smart Wearables',
          value: 50000,
          growthRate: 14.8,
          description: 'Smartwatches and fitness bands with advanced health monitoring',
          companies: [
            { name: 'Fitbit', website: 'fitbit.com', fundingStage: 'acquired', marketCap: 2100, headquarters: 'San Francisco, CA' },
            { name: 'Whoop', website: 'whoop.com', fundingStage: 'series-f', marketCap: 3600, headquarters: 'Boston, MA' },
            { name: 'Oura Ring', website: 'ouraring.com', fundingStage: 'series-c', marketCap: 2500, headquarters: 'Oulu, Finland' },
            { name: 'Amazfit', website: 'amazfit.com', fundingStage: 'public', marketCap: 1800, headquarters: 'Hefei, China' }
          ]
        },
        {
          id: 'mobile-fitness-apps',
          name: 'Mobile Fitness Apps',
          value: 32000,
          growthRate: 16.5,
          description: 'Mobile applications for activity tracking and workout logging',
          companies: [
            { name: 'Strava', website: 'strava.com', fundingStage: 'series-f', marketCap: 1500, headquarters: 'San Francisco, CA' },
            { name: 'MapMyFitness', website: 'mapmyfitness.com', fundingStage: 'acquired', marketCap: 475, headquarters: 'Austin, TX' },
            { name: 'Runkeeper', website: 'runkeeper.com', fundingStage: 'acquired', marketCap: 85, headquarters: 'Boston, MA' }
          ]
        }
      ]
    },
    {
      id: 'digital-coaching',
      name: 'Digital Health Coaching',
      value: 65000,
      growthRate: 18.5,
      description: 'Personalized health and wellness coaching platforms',
      metadata: {
        region: ['North America', 'Europe'],
        maturity: 'growing',
        competitiveIntensity: 'medium',
        keyTrends: ['AI coaching', 'Behavioral psychology', 'Chronic disease management'],
        strategicFit: 5
      },
      children: [
        {
          id: 'wellness-coaching',
          name: 'Wellness Coaching Apps',
          value: 40000,
          growthRate: 20.1,
          description: 'Apps providing personalized wellness programs and lifestyle coaching',
          companies: [
            { name: 'Noom', website: 'noom.com', fundingStage: 'series-f', marketCap: 3700, headquarters: 'New York, NY' },
            { name: 'MyFitnessPal', website: 'myfitnesspal.com', fundingStage: 'acquired', marketCap: 475, headquarters: 'San Francisco, CA' }
          ]
        },
        {
          id: 'ai-health-advisors',
          name: 'AI Health Advisors',
          value: 25000,
          growthRate: 16.2,
          description: 'AI-powered platforms providing health insights and recommendations',
          companies: [
            { name: 'Livongo', website: 'livongo.com', fundingStage: 'acquired', marketCap: 13700, headquarters: 'Mountain View, CA' },
            { name: 'Omada Health', website: 'omadahealth.com', fundingStage: 'series-e', marketCap: 1600, headquarters: 'San Francisco, CA' }
          ]
        }
      ]
    },
    {
      id: 'corporate-wellness',
      name: 'Corporate Wellness',
      value: 48000,
      growthRate: 12.8,
      description: 'Enterprise wellness programs and employee health management',
      metadata: {
        region: ['North America', 'Europe'],
        maturity: 'mature',
        competitiveIntensity: 'high',
        keyTrends: ['Remote workforce', 'Mental health focus', 'Incentive programs'],
        strategicFit: 4
      },
      children: [
        {
          id: 'employee-engagement',
          name: 'Employee Engagement Platforms',
          value: 30000,
          growthRate: 13.5,
          description: 'Platforms to engage employees in wellness activities',
          companies: [
            { name: 'Virgin Pulse', website: 'virginpulse.com', fundingStage: 'private', marketCap: 1800, headquarters: 'Providence, RI' },
            { name: 'Wellable', website: 'wellable.co', fundingStage: 'series-a', marketCap: 45, headquarters: 'Boston, MA' }
          ]
        },
        {
          id: 'wellness-rewards',
          name: 'Incentivized Programs',
          value: 18000,
          growthRate: 11.8,
          description: 'Rewards and incentives for wellness participation',
          companies: [
            { name: 'Achievement', website: 'myachievement.com', fundingStage: 'series-b', marketCap: 120, headquarters: 'San Francisco, CA' },
            { name: 'Sweatcoin', website: 'sweatco.in', fundingStage: 'series-a', marketCap: 30, headquarters: 'London, UK' }
          ]
        }
      ]
    },
    {
      id: 'nutrition',
      name: 'Nutrition & Diet Management',
      value: 42000,
      growthRate: 16.7,
      description: 'Digital nutrition tracking and dietary guidance solutions',
      metadata: {
        region: ['Global'],
        maturity: 'growing',
        competitiveIntensity: 'high',
        keyTrends: ['Personalized nutrition', 'Food scanning AI', 'Microbiome analysis'],
        strategicFit: 4
      },
      children: [
        {
          id: 'meal-planning',
          name: 'Meal Planning Apps',
          value: 26000,
          growthRate: 18.2,
          description: 'Apps for meal planning and nutrition tracking',
          companies: [
            { name: 'Lose It!', website: 'loseit.com', fundingStage: 'acquired', marketCap: 85, headquarters: 'Boston, MA' },
            { name: 'Lifesum', website: 'lifesum.com', fundingStage: 'series-b', marketCap: 50, headquarters: 'Stockholm, Sweden' }
          ]
        },
        {
          id: 'virtual-dietitians',
          name: 'Virtual Dietitian Platforms',
          value: 16000,
          growthRate: 14.5,
          description: 'Connect users with registered dietitians virtually',
          companies: [
            { name: 'Fay Nutrition', website: 'fay.co', fundingStage: 'series-a', marketCap: 25, headquarters: 'Chicago, IL' }
          ]
        }
      ]
    },
    {
      id: 'mental-health',
      name: 'Mental Health & Mindfulness',
      value: 45000,
      growthRate: 24.6,
      description: 'Digital mental health and mindfulness applications',
      metadata: {
        region: ['Global'],
        maturity: 'growing',
        competitiveIntensity: 'high',
        keyTrends: ['Teletherapy', 'AI chatbots', 'Workplace mental health'],
        strategicFit: 3
      },
      children: [
        {
          id: 'meditation-apps',
          name: 'Meditation & Mindfulness',
          value: 25000,
          growthRate: 22.1,
          description: 'Apps for meditation, breathing exercises, and mindfulness',
          companies: [
            { name: 'Headspace', website: 'headspace.com', fundingStage: 'acquired', marketCap: 3000, headquarters: 'Santa Monica, CA' },
            { name: 'Calm', website: 'calm.com', fundingStage: 'series-c', marketCap: 2000, headquarters: 'San Francisco, CA' }
          ]
        },
        {
          id: 'mental-health-therapy',
          name: 'Digital Therapy Platforms',
          value: 20000,
          growthRate: 27.8,
          description: 'Online therapy and mental health support platforms',
          companies: [
            { name: 'BetterHelp', website: 'betterhelp.com', fundingStage: 'public', marketCap: 1200, headquarters: 'Mountain View, CA' },
            { name: 'Talkspace', website: 'talkspace.com', fundingStage: 'public', marketCap: 750, headquarters: 'New York, NY' }
          ]
        }
      ]
    }
  ]
};

// Export helpers
export { getGrowthColor, calculateTotalValue, getNodeById } from '@/types/industryMap';
