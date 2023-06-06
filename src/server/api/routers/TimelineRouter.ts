export type TimelineEvent = {
  id: string;
  topic: string;
  icon: JSX.Element;
  description: string;
  color: string;
  start: Date;
  end?: Date;
  complete: boolean;
};
