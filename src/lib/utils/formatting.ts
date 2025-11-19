const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
};

export function formatCurrency(value: number): string {
	return `$${value.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}`;
}

export function formatCurrencyShort(value: number): string {
	const absValue = Math.abs(value);
	const sign = value < 0 ? '-' : '';

	if (absValue >= 1_000_000_000) {
		return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}b`;
	} else if (absValue >= 1_000_000) {
		return `${sign}$${(absValue / 1_000_000).toFixed(1)}m`;
	} else if (absValue >= 1_000) {
		return `${sign}$${(absValue / 1_000).toFixed(0)}k`;
	} else {
		return `${sign}$${absValue.toFixed(0)}`;
	}
}

export function parseCurrency(str: string): number | null {
	const COMMA_REGEX = /,/g;
	return parseFloat(str.replace(COMMA_REGEX, ''));
}
