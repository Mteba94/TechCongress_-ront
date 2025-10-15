export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'workshop' | 'competition' | 'social';
  status: 'active' | 'draft' | 'completed' | 'cancelled';
  instructor: {
    name: string;
  };
  schedule: {
    startDate: string;
    startTime: string;
  };
  location: {
    type: 'virtual' | 'physical';
    room?: string;
    platform?: string;
  };
  capacity: {
    max: number;
    enrolled: number;
    waitlist: number;
  };
  tags: string[];
  pricing: {
    type: 'free' | 'paid';
    amount?: number;
    currency?: string;
  };
}
