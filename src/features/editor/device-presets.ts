export type DevicePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export const DEVICE_PRESETS: DevicePreset[] = [
  // iPhone App Store targets
  { id: "iphone-6-9-1320", label: 'iPhone 6.9" App Store', width: 1320, height: 2868 },
  { id: "iphone-6-9-1290", label: 'iPhone 6.9" App Store alternate', width: 1290, height: 2796 },
  { id: "iphone-6-5-1284", label: 'iPhone 6.5" App Store', width: 1284, height: 2778 },
  { id: "iphone-6-5-1242", label: 'iPhone 6.5" App Store alternate', width: 1242, height: 2688 },
  { id: "iphone-8-plus-5-5-legacy", label: 'iPhone 8 Plus (5.5") - Legacy', width: 1242, height: 2208 },

  // iPad App Store targets
  { id: "ipad-pro-13-primary", label: 'iPad Pro (13") - Primary', width: 2064, height: 2752 },
  { id: "ipad-pro-12-9-fallback", label: 'iPad Pro (12.9") - Fallback', width: 2048, height: 2732 },
  { id: "ipad-pro-11-fallback", label: 'iPad Pro (11") - Fallback', width: 1668, height: 2388 },

  // macOS App Store targets (16:10)
  { id: "mac-16-10-minimum", label: "Mac App (16:10) - Minimum", width: 1280, height: 800 },
  { id: "mac-16-10-standard", label: "Mac App (16:10) - Standard", width: 1440, height: 900 },
  { id: "mac-16-10-retina", label: "Mac App (16:10) - Retina", width: 2560, height: 1600 },
  { id: "mac-16-10-retina-plus", label: "Mac App (16:10) - Retina+", width: 2880, height: 1800 },
];

export function findDevicePreset(width: number, height: number) {
  return DEVICE_PRESETS.find((preset) => preset.width === width && preset.height === height) || null;
}
