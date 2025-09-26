export interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: boolean;
  instructor: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  capacity: number;
  enrolled: number;
  code: string;
}