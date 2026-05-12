declare namespace Temporal {
  class Instant {
    static from(iso8601String: string): Instant;
    toZonedDateTimeISO(timeZoneId: string): ZonedDateTime;
  }

  class ZonedDateTime {
    toPlainDate(): PlainDate;
  }

  class PlainDate {
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
  }

  namespace Now {
    function timeZoneId(): string;
  }
}
