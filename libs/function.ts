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

export function relativeTimeFormat(timestamp?: string, locale: string = 'vi'): string {
  if (!timestamp) return '';

  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const translations = {
    vi: {
      justNow: 'Vừa xong',
      minutesAgo: (n: number) => `${n} phút trước`,
      hoursAgo: (n: number) => `${n} giờ trước`,
      daysAgo: (n: number) => `${n} ngày trước`,
      weeksAgo: (n: number) => `${n} tuần trước`,
      monthsAgo: (n: number) => `${n} tháng trước`,
      yearsAgo: (n: number) => `${n} năm trước`,
    },
    en: {
      justNow: 'Just now',
      minutesAgo: (n: number) => `${n} minute${n > 1 ? 's' : ''} ago`,
      hoursAgo: (n: number) => `${n} hour${n > 1 ? 's' : ''} ago`,
      daysAgo: (n: number) => `${n} day${n > 1 ? 's' : ''} ago`,
      weeksAgo: (n: number) => `${n} week${n > 1 ? 's' : ''} ago`,
      monthsAgo: (n: number) => `${n} month${n > 1 ? 's' : ''} ago`,
      yearsAgo: (n: number) => `${n} year${n > 1 ? 's' : ''} ago`,
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  if (diffMinutes < 1) return t.justNow;
  if (diffMinutes < 60) return t.minutesAgo(diffMinutes);
  if (diffHours < 24) return t.hoursAgo(diffHours);
  if (diffDays < 7) return t.daysAgo(diffDays);
  if (diffWeeks < 4) return t.weeksAgo(diffWeeks);
  if (diffMonths < 12) return t.monthsAgo(diffMonths);
  return t.yearsAgo(diffYears);
}