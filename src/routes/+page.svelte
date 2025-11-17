<script lang="ts">
	function pmt(ir: number, np: number, pv: number) {
		/*
		 * ir   - interest rate per month
		 * np   - number of periods (months)
		 * pv   - present value
		 * fv   - future value
		 * type - when the payments are due:
		 *        0: end of the period, e.g. end of month (default)
		 *        1: beginning of period
		 *
		 * https://stackoverflow.com/questions/5294074/pmt-function-in-javascript
		 */
		var pmt, pvif;

		if (ir === 0) return -pv / np;

		pvif = Math.pow(1 + ir, np);
		pmt = (-ir * (pv * pvif)) / (pvif - 1);

		return pmt;
	}

	function pv(rate: number, nper: number, pmt: number) {
		let pv_value;
		if (rate == 0) {
			// Interest rate is 0
			pv_value = -(pmt * nper);
		} else {
			let x = Math.pow(1 + rate, -nper);
			let y = Math.pow(1 + rate, nper);
			pv_value = -(x * (rate - pmt + y * pmt)) / rate;
		}
		return pv_value;
	}

	function calculate(
		original_loan_size: number,
		original_loan_term: number,
		rate: number,
		months_paid: number,
		down_payment: number,
		new_rate: number,
		new_term: number,
		refi_cost_rate: number
	) {
		let original_monthly_payment = pmt(rate / 12, original_loan_term * 12, -original_loan_size);
		let current_mortgage_balance = pv(
			rate / 12,
			original_loan_term * 12 - months_paid,
			-original_monthly_payment
		);
		let current_equity = original_loan_size - current_mortgage_balance + down_payment;
		let current_ltv = original_loan_size / (original_loan_size + down_payment);

		// refi calcs
		let new_loan_size = current_mortgage_balance;
		let refi_cost = refi_cost_rate * new_loan_size;

		let new_monthly_payment = pmt(new_rate / 12, new_term * 12, -new_loan_size);
		let monthly_savings = original_monthly_payment - new_monthly_payment;
		let total_savings = monthly_savings * original_loan_term * 12 - new_term;
		let months_to_breakeven = refi_cost / monthly_savings;

		return {
			original_monthly_payment,
			current_mortgage_balance,
			current_equity,
			new_loan_size,
			refi_cost,
			new_monthly_payment,
			monthly_savings,
			total_savings,
			months_to_breakeven
		};
	}

	let inputs = $state({
		original_loan_size: 500_000,
		original_loan_term: 30,
		rate: 0.065,
		months_paid: 0,
		down_payment: 100_000,
		new_rate: 0.05,
		new_term: 30,
		refi_cost_rate: 0.01
	});

	// Display values for formatting
	let displayValues = $state({
		original_loan_size: '500,000',
		rate: '6.5',
		down_payment: '100,000',
		new_rate: '5',
		refi_cost_rate: '1'
	});

	function formatCurrency(value: number): string {
		return value.toLocaleString('en-US');
	}

	function parseCurrency(str: string): number {
		return parseFloat(str.replace(/,/g, '')) || 0;
	}

	function formatPercent(value: number): string {
		return (value * 100).toString();
	}

	function parsePercent(str: string): number {
		const num = parseFloat(str.replace(/%/g, '')) || 0;
		return num / 100;
	}

	function handleCurrencyInput(field: 'original_loan_size' | 'down_payment', event: Event) {
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

	function handlePercentInput(field: 'rate' | 'new_rate' | 'refi_cost_rate', event: Event) {
		const target = event.target as HTMLInputElement;
		let value = target.value.replace(/%/g, '');

		const numericValue = parseFloat(value) || 0;
		inputs[field] = numericValue / 100;
		displayValues[field] = numericValue.toString();
	}

	let outputs = $derived(
		calculate(
			inputs.original_loan_size,
			inputs.original_loan_term,
			inputs.rate,
			inputs.months_paid,
			inputs.down_payment,
			inputs.new_rate,
			inputs.new_term,
			inputs.refi_cost_rate
		)
	);
</script>

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-900">Mortgage Refinance Calculator</h1>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Left Column: Inputs -->
		<div class="space-y-6">
			<!-- Current Mortgage Section -->
			<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
				<h2 class="mb-4 text-xl font-semibold text-gray-900">Current Mortgage</h2>
				<div class="space-y-4">
					<div>
						<label for="original_loan_size" class="mb-2 block text-sm font-medium text-gray-700">
							Original Loan Size
						</label>
						<div class="relative">
							<span
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
							>
								$
							</span>
							<input
								id="original_loan_size"
								type="text"
								value={displayValues.original_loan_size}
								oninput={(e) => handleCurrencyInput('original_loan_size', e)}
								class="block w-full rounded-md border-0 py-2 pr-3 pl-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
						</div>
					</div>

					<div>
						<label for="original_loan_term" class="mb-2 block text-sm font-medium text-gray-700">
							Original Loan Term (years)
						</label>
						<input
							id="original_loan_term"
							type="number"
							bind:value={inputs.original_loan_term}
							class="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
						/>
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
						<label for="months_paid" class="mb-2 block text-sm font-medium text-gray-700">
							Months Paid
						</label>
						<input
							id="months_paid"
							type="number"
							bind:value={inputs.months_paid}
							class="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
						/>
					</div>

					<div>
						<label for="down_payment" class="mb-2 block text-sm font-medium text-gray-700">
							Down Payment
						</label>
						<div class="relative">
							<span
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
							>
								$
							</span>
							<input
								id="down_payment"
								type="text"
								value={displayValues.down_payment}
								oninput={(e) => handleCurrencyInput('down_payment', e)}
								class="block w-full rounded-md border-0 py-2 pr-3 pl-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Refinance Options Section -->
			<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
				<h2 class="mb-4 text-xl font-semibold text-gray-900">Refinance Options</h2>
				<div class="space-y-4">
					<div>
						<label for="new_rate" class="mb-2 block text-sm font-medium text-gray-700">
							New Interest Rate
						</label>
						<div class="relative">
							<input
								id="new_rate"
								type="text"
								value={displayValues.new_rate}
								oninput={(e) => handlePercentInput('new_rate', e)}
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
						<label for="new_term" class="mb-2 block text-sm font-medium text-gray-700">
							New Loan Term (years)
						</label>
						<input
							id="new_term"
							type="number"
							bind:value={inputs.new_term}
							class="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
						/>
					</div>

					<div>
						<label for="refi_cost_rate" class="mb-2 block text-sm font-medium text-gray-700">
							Refi Cost Rate
						</label>
						<div class="relative">
							<input
								id="refi_cost_rate"
								type="text"
								value={displayValues.refi_cost_rate}
								oninput={(e) => handlePercentInput('refi_cost_rate', e)}
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
			<h2 class="text-2xl font-bold text-gray-900">Results</h2>

			<div class="space-y-6">
			<!-- Current Mortgage -->
			<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">Current Mortgage</h3>
				<div class="space-y-3">
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-gray-600">Original Monthly Payment:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.original_monthly_payment.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-gray-600">Current Mortgage Balance:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.current_mortgage_balance.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-gray-600">Current Equity:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.current_equity.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
				</div>
			</div>

			<!-- Refinance Details -->
			<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">Refinance Details</h3>
				<div class="space-y-3">
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-gray-600">New Loan Size:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.new_loan_size.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-gray-600">Refinance Cost:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.refi_cost.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-gray-600">New Monthly Payment:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.new_monthly_payment.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
				</div>
			</div>

			<!-- Savings Analysis -->
			<div
				class="rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-sm ring-1 ring-indigo-200"
			>
				<h3 class="mb-4 text-lg font-semibold text-indigo-900">Savings Analysis</h3>
				<div class="space-y-3">
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-indigo-700">Monthly Savings:</span>
						<span class="text-lg font-bold text-indigo-900">
							${outputs.monthly_savings.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-indigo-700">Total Savings:</span>
						<span class="text-lg font-bold text-indigo-900">
							${outputs.total_savings.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-indigo-700">Months to Break Even:</span>
						<span class="text-lg font-bold text-indigo-900">
							{outputs.months_to_breakeven.toFixed(1)} months
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
