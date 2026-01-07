export const numberFormat = (price: number, currency: boolean = false) => {
  const format = new Intl.NumberFormat("vi-VN", {
    style: currency ? "currency" : undefined,
    currency: currency ? "VND" : undefined,
  }).format(price);
  return format;
};

export function objectToFormData(
  formData: FormData,
  data: Record<string, unknown>,
  parentKey: string | null = null
) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      const newKey = parentKey ? `${parentKey}[${key}]` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const newItemKey = `${newKey}[${index}]`;
          if (item instanceof File) {
            formData.append(newItemKey, item);
            return;
          }
          if (typeof item === "object" && item !== null) {
            objectToFormData(formData, item as Record<string, unknown>, newItemKey);
            return;
          }
          formData.append(newItemKey, item as string | Blob);
        });
      } else if (value instanceof File) {
        formData.append(newKey, value);
      } else if (typeof value === "object" && value !== null) {
        objectToFormData(formData, value as Record<string, unknown>, newKey);
      } else {
        formData.append(newKey, value as string | Blob);
      }
    }
  }
}

export function dateFormat(timestamp?: string) {
  return timestamp ? new Date(timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : ''
}