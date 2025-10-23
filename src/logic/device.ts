import { NavbarCard } from '../navbar-card';

/**
 * Check if we are on a desktop device
 */
export const checkDesktop = (context: NavbarCard) => {
  return (
    (window.innerWidth ?? 0) >= (context.config?.desktop?.min_width ?? 768)
  );
};
