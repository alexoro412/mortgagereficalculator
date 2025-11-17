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

<main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Mortgage Refinance Calculator</h1>

	<form class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 mb-8">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<label for="original_loan_size" class="block text-sm font-medium text-gray-700 mb-2">
					Original Loan Size ($)
				</label>
				<input
					id="original_loan_size"
					type="number"
					bind:value={inputs.original_loan_size}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>

			<div>
				<label for="original_loan_term" class="block text-sm font-medium text-gray-700 mb-2">
					Original Loan Term (years)
				</label>
				<input
					id="original_loan_term"
					type="number"
					bind:value={inputs.original_loan_term}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>

			<div>
				<label for="rate" class="block text-sm font-medium text-gray-700 mb-2">
					Interest Rate (decimal, e.g., 0.065 for 6.5%)
				</label>
				<input
					id="rate"
					type="number"
					step="0.001"
					bind:value={inputs.rate}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>

			<div>
				<label for="months_paid" class="block text-sm font-medium text-gray-700 mb-2">
					Months Paid
				</label>
				<input
					id="months_paid"
					type="number"
					bind:value={inputs.months_paid}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>

			<div>
				<label for="down_payment" class="block text-sm font-medium text-gray-700 mb-2">
					Down Payment ($)
				</label>
				<input
					id="down_payment"
					type="number"
					bind:value={inputs.down_payment}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>

			<div>
				<label for="new_rate" class="block text-sm font-medium text-gray-700 mb-2">
					New Interest Rate (decimal)
				</label>
				<input
					id="new_rate"
					type="number"
					step="0.001"
					bind:value={inputs.new_rate}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>

			<div>
				<label for="new_term" class="block text-sm font-medium text-gray-700 mb-2">
					New Loan Term (years)
				</label>
				<input
					id="new_term"
					type="number"
					bind:value={inputs.new_term}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>

			<div>
				<label for="refi_cost_rate" class="block text-sm font-medium text-gray-700 mb-2">
					Refi Cost Rate (decimal, e.g., 0.01 for 1%)
				</label>
				<input
					id="refi_cost_rate"
					type="number"
					step="0.001"
					bind:value={inputs.refi_cost_rate}
					class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>
		</div>
	</form>

	<section>
		<h2 class="text-2xl font-bold text-gray-900 mb-6">Results</h2>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Current Mortgage -->
			<div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Current Mortgage</h3>
				<div class="space-y-3">
					<div class="flex justify-between items-baseline">
						<span class="text-sm text-gray-600">Original Monthly Payment:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.original_monthly_payment.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex justify-between items-baseline">
						<span class="text-sm text-gray-600">Current Mortgage Balance:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.current_mortgage_balance.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex justify-between items-baseline">
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
			<div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Refinance Details</h3>
				<div class="space-y-3">
					<div class="flex justify-between items-baseline">
						<span class="text-sm text-gray-600">New Loan Size:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.new_loan_size.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex justify-between items-baseline">
						<span class="text-sm text-gray-600">Refinance Cost:</span>
						<span class="text-lg font-semibold text-gray-900">
							${outputs.refi_cost.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex justify-between items-baseline">
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
			<div class="bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm ring-1 ring-indigo-200 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-indigo-900 mb-4">Savings Analysis</h3>
				<div class="space-y-3">
					<div class="flex justify-between items-baseline">
						<span class="text-sm text-indigo-700">Monthly Savings:</span>
						<span class="text-lg font-bold text-indigo-900">
							${outputs.monthly_savings.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex justify-between items-baseline">
						<span class="text-sm text-indigo-700">Total Savings:</span>
						<span class="text-lg font-bold text-indigo-900">
							${outputs.total_savings.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</span>
					</div>
					<div class="flex justify-between items-baseline">
						<span class="text-sm text-indigo-700">Months to Break Even:</span>
						<span class="text-lg font-bold text-indigo-900">
							{outputs.months_to_breakeven.toFixed(1)} months
						</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>
