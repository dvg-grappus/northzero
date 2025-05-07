export type TimelineStepState = 'locked' | 'ready' | 'in-progress' | 'completed';

export interface Step {
  id: string;
  title: string;
  description: string;
  state: TimelineStepState;
}
