// Shared visual primitives used across the authenticated app.
// Per-page components stay where they are; primitives live here.

export { ProfileBanner, type ProfileBannerProps } from './profile-banner';
export { MatchBadge, type MatchBadgeProps } from './match-badge';
export { MetricStat, type MetricStatProps } from './metric-stat';
export { FilterPills, type FilterPill, type FilterPillsProps } from './filter-pills';
export { EmptyState, type EmptyStateProps } from './empty-state';
export { SectionHeader, type SectionHeaderProps } from './section-header';
export { CompanyAvatar } from './company-avatar';
export { StickyRail, type StickyRailProps } from './sticky-rail';
export {
  StatusBadge,
  type StatusBadgeProps,
  type ApplicationStatus as StatusBadgeStatus,
} from './status-badge';
