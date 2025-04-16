
type FeatureFlag = string;

const FEATURE_FLAGS: Record<string, boolean> = {
  // Add feature flags here as they are implemented
  USE_NEW_UPLOAD: false,
  ENABLE_FILE_SHARING: false,
  ENABLE_FILE_METADATA: true,
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // If flag doesn't exist, treat as disabled
  return !!FEATURE_FLAGS[flag];
}

export function withFeatureFlag<T>(
  flag: FeatureFlag,
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<T>
): React.ComponentType<T> {
  // Return a new component that checks the feature flag
  return function FeatureFlaggedComponent(props: T) {
    const isEnabled = isFeatureEnabled(flag);
    
    if (isEnabled) {
      return <Component {...props} />;
    }
    
    // Return fallback if provided, otherwise null
    return FallbackComponent ? <FallbackComponent {...props} /> : null;
  };
}
