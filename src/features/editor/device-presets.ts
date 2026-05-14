export type DevicePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export const DEVICE_PRESETS: DevicePreset[] = [
  // iPhone App Store targets
  { id: "iphone-6-5-1242", label: 'iPhone 6.5" App Store', width: 1242, height: 2688 },
  { id: "iphone-6-5-1284", label: 'iPhone 6.5" App Store alternate', width: 1284, height: 2778 },
  { id: "iphone-6-9-1320", label: 'iPhone 6.9" App Store', width: 1320, height: 2868 },
  { id: "iphone-8-plus-5-5-legacy", label: 'iPhone 8 Plus (5.5") - Legacy', width: 1242, height: 2208 },

  // Android phone targets
  { id: "android-play-store-1080", label: "Android Play Store phone", width: 1080, height: 1920 },
  { id: "android-pixel-1080", label: "Android Pixel / Galaxy standard", width: 1080, height: 2400 },
  { id: "android-pixel-pro-1220", label: "Android Pixel Pro", width: 1220, height: 2712 },
  { id: "android-pixel-xl-1344", label: "Android Pixel XL", width: 1344, height: 2992 },
  { id: "android-galaxy-ultra-1440", label: "Android Galaxy Ultra", width: 1440, height: 3120 },
  { id: "android-qhd-1440", label: "Android QHD phone", width: 1440, height: 2560 },
];

export function findDevicePreset(width: number, height: number) {
  return DEVICE_PRESETS.find((preset) => preset.width === width && preset.height === height) || null;
}
