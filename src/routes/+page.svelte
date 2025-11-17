<script lang="ts">
	import CurrencyInput from '$lib/components/CurrencyInput.svelte';
	import PercentInput from '$lib/components/PercentInput.svelte';
	import NumberInput from '$lib/components/NumberInput.svelte';
	import InputSection from '$lib/components/InputSection.svelte';
	import Card from '$lib/components/Card.svelte';
	import OutputRow from '$lib/components/OutputRow.svelte';

	// ===== TYPE DEFINITIONS =====

	type CurrencyField = 'originalLoanSize' | 'downPayment';
	type PercentField = 'rate' | 'newRate' | 'refiCostRate';

	interface MortgageInputs {
		originalLoanSize: number;
		originalLoanTerm: number;
		rate: number;
		monthsPaid: number;
		downPayment: number;
		newRate: number;
		newTerm: number;
		refiCostRate: number;
	}

	interface DisplayValues {
		originalLoanSize: string;
		rate: string;
		downPayment: string;
		newRate: string;
		refiCostRate: string;
	}

	interface CalculationResults {
		originalMonthlyPayment: number;
		currentMortgageBalance: number;
		currentEquity: number;
		newLoanSize: number;
		refiCost: number;
		newMonthlyPayment: number;
		monthlySavings: number;
		totalSavings: number;
		monthsToBreakeven: number;
	}

	// ===== CONSTANTS =====

	const MONTHS_PER_YEAR = 12;
	const COMMA_REGEX = /,/g;
	const PERCENT_REGEX = /%/g;
	const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	};

	// ===== FINANCIAL CALCULATIONS =====

	/**
	 * Calculate monthly payment for a loan
	 * @param monthlyInterestRate - Interest rate per month (annual rate / 12)
	 * @param numberOfPeriods - Number of periods (months)
	 * @param presentValue - Present value (loan amount, typically negative)
	 * @returns Monthly payment amount
	 *
	 * Based on: https://stackoverflow.com/questions/5294074/pmt-function-in-javascript
	 */
	function calculateMonthlyPayment(
		monthlyInterestRate: number,
		numberOfPeriods: number,
		presentValue: number
	): number {
		if (monthlyInterestRate === 0) {
			return -presentValue / numberOfPeriods;
		}

		const presentValueInterestFactor = Math.pow(1 + monthlyInterestRate, numberOfPeriods);
		const paymentAmount =
			(-monthlyInterestRate * (presentValue * presentValueInterestFactor)) /
			(presentValueInterestFactor - 1);

		return paymentAmount;
	}

	/**
	 * Calculate present value (remaining loan balance)
	 * @param monthlyRate - Interest rate per month
	 * @param numberOfPeriods - Number of remaining periods
	 * @param monthlyPayment - Monthly payment amount
	 * @returns Present value (remaining balance)
	 */
	function calculatePresentValue(
		monthlyRate: number,
		numberOfPeriods: number,
		monthlyPayment: number
	): number {
		if (monthlyRate === 0) {
			return -(monthlyPayment * numberOfPeriods);
		}

		const discountFactor = Math.pow(1 + monthlyRate, -numberOfPeriods);
		const compoundFactor = Math.pow(1 + monthlyRate, numberOfPeriods);
		const presentValue =
			-(discountFactor * (monthlyRate - monthlyPayment + compoundFactor * monthlyPayment)) /
			monthlyRate;

		return presentValue;
	}

	/**
	 * Calculate refinance analysis
	 */
	function calculate(inputs: MortgageInputs): CalculationResults {
		const {
			originalLoanSize,
			originalLoanTerm,
			rate,
			monthsPaid,
			downPayment,
			newRate,
			newTerm,
			refiCostRate
		} = inputs;

		// Calculate current mortgage details
		const originalMonthlyPayment = calculateMonthlyPayment(
			rate / MONTHS_PER_YEAR,
			originalLoanTerm * MONTHS_PER_YEAR,
			-originalLoanSize
		);

		const currentMortgageBalance = calculatePresentValue(
			rate / MONTHS_PER_YEAR,
			originalLoanTerm * MONTHS_PER_YEAR - monthsPaid,
			-originalMonthlyPayment
		);

		const currentEquity = originalLoanSize - currentMortgageBalance + downPayment;

		// Calculate refinance details
		const newLoanSize = currentMortgageBalance;
		const refiCost = refiCostRate * newLoanSize;

		const newMonthlyPayment = calculateMonthlyPayment(
			newRate / MONTHS_PER_YEAR,
			newTerm * MONTHS_PER_YEAR,
			-newLoanSize
		);

		const monthlySavings = originalMonthlyPayment - newMonthlyPayment;

		// Total savings over the remaining life of the original loan
		const remainingMonthsOnOriginalLoan = originalLoanTerm * MONTHS_PER_YEAR - monthsPaid;
		const totalSavings = monthlySavings * remainingMonthsOnOriginalLoan;

		const monthsToBreakeven = refiCost / monthlySavings;

		return {
			originalMonthlyPayment,
			currentMortgageBalance,
			currentEquity,
			newLoanSize,
			refiCost,
			newMonthlyPayment,
			monthlySavings,
			totalSavings,
			monthsToBreakeven
		};
	}

	// ===== FORMATTING UTILITIES =====

	function formatCurrency(value: number): string {
		return value.toLocaleString('en-US');
	}

	function parseCurrency(str: string): number {
		return parseFloat(str.replace(COMMA_REGEX, '')) || 0;
	}

	function formatPercent(value: number): string {
		return (value * 100).toString();
	}

	function parsePercent(str: string): number {
		const num = parseFloat(str.replace(PERCENT_REGEX, '')) || 0;
		return num / 100;
	}

	// ===== STATE MANAGEMENT =====

	let inputs = $state<MortgageInputs>({
		originalLoanSize: 500_000,
		originalLoanTerm: 30,
		rate: 0.065,
		monthsPaid: 0,
		downPayment: 100_000,
		newRate: 0.05,
		newTerm: 30,
		refiCostRate: 0.01
	});

	let displayValues = $state<DisplayValues>({
		originalLoanSize: '500,000',
		rate: '6.5',
		downPayment: '100,000',
		newRate: '5',
		refiCostRate: '1'
	});

	// ===== EVENT HANDLERS =====

	function handleCurrencyInput(field: CurrencyField, event: Event): void {
		const target = event.target as HTMLInputElement;
		const cursorPos = target.selectionStart || 0;
		const oldLength = displayValues[field].length;

		const numericValue = parseCurrency(target.value);
		inputs[field] = numericValue;
		displayValues[field] = formatCurrency(numericValue);

		// Restore cursor position accounting for comma changes
		const newLength = displayValues[field].length;
		const newCursorPos = cursorPos + (newLength - oldLength);
		requestAnimationFrame(() => {
			target.setSelectionRange(newCursorPos, newCursorPos);
		});
	}

	function handlePercentInput(field: PercentField, event: Event): void {
		const target = event.target as HTMLInputElement;
		const value = target.value.replace(PERCENT_REGEX, '');

		const numericValue = parseFloat(value) || 0;
		inputs[field] = numericValue / 100;
		displayValues[field] = numericValue.toString();
	}

	// ===== DERIVED STATE =====

	let outputs = $derived<CalculationResults>(calculate(inputs));

	// ===== HELPER FUNCTIONS =====

	function formatCurrencyOutput(value: number): string {
		return `$${value.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}`;
	}
</script>

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8 flex items-center gap-3">
		<img src="/frog.svg" alt="Frog logo" class="h-12 w-12" />
		<h1 class="text-3xl font-bold text-gray-900">
			Mortgage Refinance Calculator<sup class="ml-1 text-sm font-normal text-gray-500">BETA</sup>
		</h1>
	</div>

	<div class="flex flex-col gap-8 lg:flex-row lg:items-start">
		<!-- Left Column: Inputs -->
		<div class="space-y-6">
			<!-- Current Mortgage Section -->
			<InputSection title="Current Mortgage">
				<CurrencyInput
					id="originalLoanSize"
					label="Original Loan Size"
					value={displayValues.originalLoanSize}
					oninput={(e) => handleCurrencyInput('originalLoanSize', e)}
				/>

				<NumberInput
					id="originalLoanTerm"
					label="Original Loan Term"
					bind:value={inputs.originalLoanTerm}
					unit="years"
				/>

				<PercentInput
					id="rate"
					label="Interest Rate"
					value={displayValues.rate}
					oninput={(e) => handlePercentInput('rate', e)}
				/>

				<NumberInput
					id="monthsPaid"
					label="Months Already Paid"
					bind:value={inputs.monthsPaid}
					unit="months"
				/>

				<CurrencyInput
					id="downPayment"
					label="Down Payment"
					value={displayValues.downPayment}
					oninput={(e) => handleCurrencyInput('downPayment', e)}
				/>
			</InputSection>

			<!-- Refinance Options Section -->
			<InputSection title="Refinance Options">
				<PercentInput
					id="newRate"
					label="New Interest Rate"
					value={displayValues.newRate}
					oninput={(e) => handlePercentInput('newRate', e)}
				/>

				<NumberInput
					id="newTerm"
					label="New Loan Term"
					bind:value={inputs.newTerm}
					unit="years"
				/>

				<PercentInput
					id="refiCostRate"
					label="Refi Cost Rate"
					value={displayValues.refiCostRate}
					oninput={(e) => handlePercentInput('refiCostRate', e)}
				/>
			</InputSection>
		</div>

		<!-- Right Column: Results -->
		<div class="space-y-6">
			<!-- Current Mortgage -->
			<Card title="Current Mortgage">
				<OutputRow label="Original Monthly Payment:" value={formatCurrencyOutput(outputs.originalMonthlyPayment)} />
				<OutputRow label="Current Mortgage Balance:" value={formatCurrencyOutput(outputs.currentMortgageBalance)} />
				<OutputRow label="Current Equity:" value={formatCurrencyOutput(outputs.currentEquity)} />
			</Card>

			<!-- Refinance Details -->
			<Card title="Refinance Details">
				<OutputRow label="New Loan Size:" value={formatCurrencyOutput(outputs.newLoanSize)} />
				<OutputRow label="Refinance Cost:" value={formatCurrencyOutput(outputs.refiCost)} />
				<OutputRow label="New Monthly Payment:" value={formatCurrencyOutput(outputs.newMonthlyPayment)} />
			</Card>

			<!-- Savings Analysis -->
			<Card
				title={outputs.monthlySavings > 0 ? 'Savings Analysis' : 'Cost Analysis'}
				class={outputs.monthlySavings > 0
					? 'bg-gradient-to-br from-green-50 to-emerald-50 ring-green-200'
					: 'bg-gradient-to-br from-red-50 to-rose-50 ring-red-200'}
			>
				{#if outputs.monthlySavings <= 0}
					<div class="mb-4 rounded-md border border-red-200 bg-red-100 p-3">
						<p class="text-sm text-red-800">
							⚠️ <strong>Warning:</strong> This refinance will cost you more money.
						</p>
					</div>
				{/if}

				<OutputRow
					label={outputs.monthlySavings > 0 ? 'Monthly Savings:' : 'Monthly Cost:'}
					value={formatCurrencyOutput(Math.abs(outputs.monthlySavings))}
					valueClass="text-lg font-bold {outputs.monthlySavings > 0 ? 'text-green-900' : 'text-red-900'}"
				/>

				<OutputRow
					label={outputs.monthlySavings > 0 ? 'Total Savings:' : 'Total Cost:'}
					value={formatCurrencyOutput(Math.abs(outputs.totalSavings))}
					valueClass="text-lg font-bold {outputs.monthlySavings > 0 ? 'text-green-900' : 'text-red-900'}"
				/>

				{#if outputs.monthlySavings > 0}
					<OutputRow
						label="Months to Break Even:"
						value="{outputs.monthsToBreakeven.toFixed(1)} months"
						valueClass="text-lg font-bold text-green-900"
					/>
				{/if}
			</Card>
		</div>
	</div>
</main>
