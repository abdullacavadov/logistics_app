const vehicleTypeImages = import.meta.glob(
  '@/assets/img/vehicle-types/*',
  {
    eager: true,
    import: 'default',
    query: '?url',
  }
) as Record<string, string>;

export function getVehicleTypeImage(
  image: string | null
): string | undefined {
  if (!image) return undefined;

  return vehicleTypeImages[
    `/src/assets/img/vehicle-types/${image}`
  ];
}