export interface Activity {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string;
  instructor: string;
  instructorBio: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  capacity: number;
  enrolled: number;
  code: string;
  learningObjectives?: string[];
  materials?: string[];
  conflictingActivities?: string[];
}