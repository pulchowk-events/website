export type PostCategory = 
  | 'discussions'
  | 'opportunities'
  | 'tech_help'
  | 'showcases'
  | 'announcements'
  | 'confessions';

export const categoryDisplayMap: Record<PostCategory, string> = {
  discussions: 'Discussions',
  opportunities: 'Opportunities',
  tech_help: 'Tech Help/Builds',
  showcases: 'Showcases',
  announcements: 'Announcements',
  confessions: 'Confessions'
};

export const categoryIcons: Record<PostCategory, string> = {
  discussions: '💭',
  opportunities: '🎯',
  tech_help: '🔧',
  showcases: '🎨',
  announcements: '📢',
  confessions: '🤫'
};