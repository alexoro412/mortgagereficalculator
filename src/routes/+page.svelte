<script lang="ts">
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
</script>

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-900">
		Mortgage Refinance Calculator<sup class="ml-1 text-sm font-normal text-gray-500">BETA</sup>
	</h1>

	<div class="flex flex-col gap-8 lg:flex-row lg:items-start">
		<!-- Left Column: Inputs -->
		<div class="space-y-6">
			<!-- Current Mortgage Section -->
			<div class="max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
				<h2 class="mb-4 text-xl font-semibold text-gray-900">Current Mortgage</h2>
				<div class="max-w-xs space-y-4">
					<div>
						<label for="originalLoanSize" class="mb-2 block text-sm font-medium text-gray-700">
							Original Loan Size
						</label>
						<div class="relative">
							<span
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
							>
								$
							</span>
							<input
								id="originalLoanSize"
								type="text"
								value={displayValues.originalLoanSize}
								oninput={(e) => handleCurrencyInput('originalLoanSize', e)}
								class="block w-full rounded-md border-0 py-2 pr-3 pl-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
						</div>
					</div>

					<div>
						<label for="originalLoanTerm" class="mb-2 block text-sm font-medium text-gray-700">
							Original Loan Term
						</label>
						<div class="relative">
							<input
								id="originalLoanTerm"
								type="number"
								bind:value={inputs.originalLoanTerm}
								class="block w-full rounded-md border-0 px-3 py-2 pr-16 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
							>
								years
							</span>
						</div>
					</div>

					<div>
						<label for="rate" class="mb-2 block text-sm font-medium text-gray-700">
							Interest Rate
						</label>
						<div class="relative">
							<input
								id="rate"
								type="text"
								value={displayValues.rate}
								oninput={(e) => handlePercentInput('rate', e)}
								class="block w-full rounded-md border-0 px-3 py-2 pr-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
							>
								%
							</span>
						</div>
					</div>

					<div>
						<label for="monthsPaid" class="mb-2 block text-sm font-medium text-gray-700">
							Months Already Paid
						</label>
						<div class="relative">
							<input
								id="monthsPaid"
								type="number"
								bind:value={inputs.monthsPaid}
								class="block w-full rounded-md border-0 px-3 py-2 pr-20 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
							>
								months
							</span>
						</div>
					</div>

					<div>
						<label for="downPayment" class="mb-2 block text-sm font-medium text-gray-700">
							Down Payment
						</label>
						<div class="relative">
							<span
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
							>
								$
							</span>
							<input
								id="downPayment"
								type="text"
								value={displayValues.downPayment}
								oninput={(e) => handleCurrencyInput('downPayment', e)}
								class="block w-full rounded-md border-0 py-2 pr-3 pl-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Refinance Options Section -->
			<div class="max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
				<h2 class="mb-4 text-xl font-semibold text-gray-900">Refinance Options</h2>
				<div class="max-w-xs space-y-4">
					<div>
						<label for="newRate" class="mb-2 block text-sm font-medium text-gray-700">
							New Interest Rate
						</label>
						<div class="relative">
							<input
								id="newRate"
								type="text"
								value={displayValues.newRate}
								oninput={(e) => handlePercentInput('newRate', e)}
								class="block w-full rounded-md border-0 px-3 py-2 pr-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
							>
								%
							</span>
						</div>
					</div>

					<div>
						<label for="newTerm" class="mb-2 block text-sm font-medium text-gray-700">
							New Loan Term
						</label>
						<div class="relative">
							<input
								id="newTerm"
								type="number"
								bind:value={inputs.newTerm}
								class="block w-full rounded-md border-0 px-3 py-2 pr-16 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
							>
								years
							</span>
						</div>
					</div>

					<div>
						<label for="refiCostRate" class="mb-2 block text-sm font-medium text-gray-700">
							Refi Cost Rate
						</label>
						<div class="relative">
							<input
								id="refiCostRate"
								type="text"
								value={displayValues.refiCostRate}
								oninput={(e) => handlePercentInput('refiCostRate', e)}
								class="block w-full rounded-md border-0 px-3 py-2 pr-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
							>
								%
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Right Column: Results -->
		<div class="space-y-6">
			<div class="space-y-6">
				<!-- Current Mortgage -->
				<div class="max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
					<h3 class="mb-4 text-lg font-semibold text-gray-900">Current Mortgage</h3>
					<div class="space-y-3">
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-sm text-gray-600">Original Monthly Payment:</span>
							<span class="text-lg font-semibold text-gray-900">
								${outputs.originalMonthlyPayment.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}
							</span>
						</div>
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-sm text-gray-600">Current Mortgage Balance:</span>
							<span class="text-lg font-semibold text-gray-900">
								${outputs.currentMortgageBalance.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}
							</span>
						</div>
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-sm text-gray-600">Current Equity:</span>
							<span class="text-lg font-semibold text-gray-900">
								${outputs.currentEquity.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}
							</span>
						</div>
					</div>
				</div>

				<!-- Refinance Details -->
				<div class="max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
					<h3 class="mb-4 text-lg font-semibold text-gray-900">Refinance Details</h3>
					<div class="space-y-3">
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-sm text-gray-600">New Loan Size:</span>
							<span class="text-lg font-semibold text-gray-900">
								${outputs.newLoanSize.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}
							</span>
						</div>
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-sm text-gray-600">Refinance Cost:</span>
							<span class="text-lg font-semibold text-gray-900">
								${outputs.refiCost.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}
							</span>
						</div>
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-sm text-gray-600">New Monthly Payment:</span>
							<span class="text-lg font-semibold text-gray-900">
								${outputs.newMonthlyPayment.toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}
							</span>
						</div>
					</div>
				</div>

				<!-- Savings Analysis -->
				<div
					class="max-w-md rounded-lg p-6 shadow-sm ring-1 {outputs.monthlySavings > 0
						? 'bg-gradient-to-br from-green-50 to-emerald-50 ring-green-200'
						: 'bg-gradient-to-br from-red-50 to-rose-50 ring-red-200'}"
				>
					<h3
						class="mb-4 text-lg font-semibold {outputs.monthlySavings > 0
							? 'text-green-900'
							: 'text-red-900'}"
					>
						{outputs.monthlySavings > 0 ? 'Savings Analysis' : 'Cost Analysis'}
					</h3>

					{#if outputs.monthlySavings <= 0}
						<div class="mb-4 rounded-md border border-red-200 bg-red-100 p-3">
							<p class="text-sm text-red-800">
								⚠️ <strong>Warning:</strong> This refinance will cost you more money.
							</p>
						</div>
					{/if}

					<div class="space-y-3">
						<div class="flex items-baseline justify-between gap-4">
							<span
								class="text-sm {outputs.monthlySavings > 0 ? 'text-green-700' : 'text-red-700'}"
								>{outputs.monthlySavings > 0 ? 'Monthly Savings:' : 'Monthly Cost:'}</span
							>
							<span
								class="text-lg font-bold {outputs.monthlySavings > 0
									? 'text-green-900'
									: 'text-red-900'}"
							>
								${Math.abs(outputs.monthlySavings).toLocaleString(
									'en-US',
									CURRENCY_FORMAT_OPTIONS
								)}
							</span>
						</div>
						<div class="flex items-baseline justify-between gap-4">
							<span
								class="text-sm {outputs.monthlySavings > 0 ? 'text-green-700' : 'text-red-700'}"
								>{outputs.monthlySavings > 0 ? 'Total Savings:' : 'Total Cost:'}</span
							>
							<span
								class="text-lg font-bold {outputs.monthlySavings > 0
									? 'text-green-900'
									: 'text-red-900'}"
							>
								${Math.abs(outputs.totalSavings).toLocaleString('en-US', CURRENCY_FORMAT_OPTIONS)}
							</span>
						</div>
						{#if outputs.monthlySavings > 0}
							<div class="flex items-baseline justify-between gap-4">
								<span class="text-sm text-green-700">Months to Break Even:</span>
								<span class="text-lg font-bold text-green-900">
									{outputs.monthsToBreakeven.toFixed(1)} months
								</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
