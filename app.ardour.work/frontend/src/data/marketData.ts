export interface MarketNode {
  name: string;
  value?: number;
  growthRate: number;
  description?: string;
  children?: MarketNode[];
  color?: string;
}

export interface BreadcrumbItem {
  name: string;
  path: number[];
}

// Color gradient based on growth rate
export const getGrowthColor = (growthRate: number): string => {
  // Growth rate ranges from -20% to +50%
  // Map to colors: red (negative) -> yellow (neutral) -> green (positive)
  if (growthRate < 0) {
    // Red shades for negative growth
    const intensity = Math.min(Math.abs(growthRate) / 20, 1);
    return `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;
  } else if (growthRate < 10) {
    // Yellow/orange for low growth
    return `rgba(251, 191, 36, ${0.3 + (growthRate / 10) * 0.3})`;
  } else {
    // Green gradient for positive growth (10% to 50%)
    const intensity = Math.min((growthRate - 10) / 40, 1);
    const baseGreen = 22;
    const midGreen = 163;
    const brightGreen = 74;

    // Interpolate between darker and brighter green
    const r = Math.round(baseGreen + (brightGreen - baseGreen) * intensity);
    const g = Math.round(163 + (197 - 163) * intensity);
    const b = Math.round(94);

    return `rgba(${r}, ${g}, ${b}, ${0.5 + intensity * 0.4})`;
  }
};

// M&A Targets Market Data - GOQii Specific
export const marketData: MarketNode = {
  name: "M&A Targets for GoQii",
  growthRate: 30,
  description: "Total addressable market for strategic acquisition targets in health and wellness technology",
  children: [
    {
      name: "Fitness and Activity Tracker Companies",
      value: 850,
      growthRate: 35,
      description: "Companies developing fitness tracking solutions and wearable technology for health monitoring",
      children: [
        {
          name: "Mobile Fitness Tracking App Developers",
          value: 500,
          growthRate: 38,
          description: "Mobile applications for fitness tracking, health monitoring, and activity logging"
        },
        {
          name: "Wearable Device Manufacturers for Fitness",
          value: 350,
          growthRate: 31,
          description: "Hardware manufacturers creating fitness bands, smartwatches, and health monitoring devices"
        }
      ]
    },
    {
      name: "Digital Health Coaching Platforms",
      value: 650,
      growthRate: 42,
      description: "Technology platforms providing personalized health and wellness coaching services",
      children: [
        {
          name: "Personalized Wellness Coaching Apps",
          value: 400,
          growthRate: 45,
          description: "Apps delivering customized wellness programs, lifestyle coaching, and behavior change support"
        },
        {
          name: "AI-driven Health Advisory Platforms",
          value: 250,
          growthRate: 37,
          description: "Artificial intelligence-powered platforms providing health insights and personalized recommendations"
        }
      ]
    },
    {
      name: "Remote Patient Monitoring Solutions",
      value: 550,
      growthRate: 28,
      description: "Technologies enabling remote health monitoring and patient care management",
      children: [
        {
          name: "Home Health Monitoring Platforms",
          value: 320,
          growthRate: 30,
          description: "Platforms for monitoring patient health metrics and vital signs from home environments"
        },
        {
          name: "Chronic Disease Management Devices",
          value: 230,
          growthRate: 25,
          description: "Specialized devices and software for managing chronic conditions like diabetes and hypertension"
        }
      ]
    },
    {
      name: "Corporate Wellness Solution Providers",
      value: 480,
      growthRate: 25,
      description: "Enterprise-focused wellness programs and employee health management solutions",
      children: [
        {
          name: "Employee Wellness Engagement Platforms",
          value: 300,
          growthRate: 27,
          description: "Platforms designed to engage employees in wellness activities and health improvement programs"
        },
        {
          name: "Incentivized Wellness Program Companies",
          value: 180,
          growthRate: 22,
          description: "Solutions offering rewards and incentives to drive employee participation in wellness initiatives"
        }
      ]
    },
    {
      name: "Nutrition and Diet Management Platforms",
      value: 420,
      growthRate: 33,
      description: "Digital solutions for nutrition tracking, meal planning, and dietary guidance",
      children: [
        {
          name: "Meal Planning and Nutrition Tracking Apps",
          value: 260,
          growthRate: 36,
          description: "Applications for tracking food intake, calories, macronutrients, and creating meal plans"
        },
        {
          name: "Virtual Dietitian and Nutrition Consultation Platforms",
          value: 160,
          growthRate: 29,
          description: "Platforms connecting users with registered dietitians and nutritionists for virtual consultations"
        }
      ]
    },
    {
      name: "Health Data Analytics and Insights Companies",
      value: 380,
      growthRate: 40,
      description: "Companies specializing in health data analysis and actionable health insights",
      children: [
        {
          name: "Population Health Data Platforms",
          value: 230,
          growthRate: 43,
          description: "Platforms analyzing large-scale health data to identify trends and improve population health outcomes"
        },
        {
          name: "Personal Health Record Analytics Providers",
          value: 150,
          growthRate: 36,
          description: "Solutions providing analytics and insights from individual health records and personal health data"
        }
      ]
    },
    {
      name: "Gamified Wellness and Health Engagement Platforms",
      value: 320,
      growthRate: 36,
      description: "Platforms using gamification mechanics to drive health and wellness engagement",
      children: [
        {
          name: "Social Wellness Challenge Platforms",
          value: 190,
          growthRate: 39,
          description: "Social platforms enabling group challenges, competitions, and community-driven wellness activities"
        },
        {
          name: "Fitness Gamification App Developers",
          value: 130,
          growthRate: 32,
          description: "Apps incorporating game mechanics like points, badges, and leaderboards into fitness activities"
        }
      ]
    }
  ]
};

// Helper function to flatten tree for easier navigation
export const flattenTree = (node: MarketNode, path: number[] = []): Array<{ node: MarketNode; path: number[] }> => {
  const result = [{ node, path }];

  if (node.children) {
    node.children.forEach((child, index) => {
      result.push(...flattenTree(child, [...path, index]));
    });
  }

  return result;
};

// Helper function to get node by path
export const getNodeByPath = (root: MarketNode, path: number[]): MarketNode => {
  let current = root;

  for (const index of path) {
    if (!current.children || !current.children[index]) {
      return root;
    }
    current = current.children[index];
  }

  return current;
};

// Helper function to calculate total market value
export const calculateTotalValue = (node: MarketNode): number => {
  if (node.value !== undefined) {
    return node.value;
  }

  if (node.children) {
    return node.children.reduce((sum, child) => sum + calculateTotalValue(child), 0);
  }

  return 0;
};
