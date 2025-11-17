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

<main>
	<h1>Mortgage Refinance Calculator</h1>

	<form>
		<div>
			<label for="original_loan_size">Original Loan Size ($):</label>
			<input id="original_loan_size" type="number" bind:value={inputs.original_loan_size} />
		</div>

		<div>
			<label for="original_loan_term">Original Loan Term (years):</label>
			<input id="original_loan_term" type="number" bind:value={inputs.original_loan_term} />
		</div>

		<div>
			<label for="rate">Interest Rate (decimal, e.g., 0.065 for 6.5%):</label>
			<input id="rate" type="number" step="0.001" bind:value={inputs.rate} />
		</div>

		<div>
			<label for="months_paid">Months Paid:</label>
			<input id="months_paid" type="number" bind:value={inputs.months_paid} />
		</div>

		<div>
			<label for="down_payment">Down Payment ($):</label>
			<input id="down_payment" type="number" bind:value={inputs.down_payment} />
		</div>

		<div>
			<label for="new_rate">New Interest Rate (decimal):</label>
			<input id="new_rate" type="number" step="0.001" bind:value={inputs.new_rate} />
		</div>

		<div>
			<label for="new_term">New Loan Term (years):</label>
			<input id="new_term" type="number" bind:value={inputs.new_term} />
		</div>

		<div>
			<label for="refi_cost_rate">Refi Cost Rate (decimal, e.g., 0.01 for 1%):</label>
			<input id="refi_cost_rate" type="number" step="0.001" bind:value={inputs.refi_cost_rate} />
		</div>
	</form>

	<section class="results">
		<h2>Results</h2>

		<div class="result-group">
			<h3>Current Mortgage</h3>
			<div class="result-item">
				<span class="label">Original Monthly Payment:</span>
				<span class="value">${outputs.original_monthly_payment.toFixed(2)}</span>
			</div>
			<div class="result-item">
				<span class="label">Current Mortgage Balance:</span>
				<span class="value">${outputs.current_mortgage_balance.toFixed(2)}</span>
			</div>
			<div class="result-item">
				<span class="label">Current Equity:</span>
				<span class="value">${outputs.current_equity.toFixed(2)}</span>
			</div>
		</div>

		<div class="result-group">
			<h3>Refinance Details</h3>
			<div class="result-item">
				<span class="label">New Loan Size:</span>
				<span class="value">${outputs.new_loan_size.toFixed(2)}</span>
			</div>
			<div class="result-item">
				<span class="label">Refinance Cost:</span>
				<span class="value">${outputs.refi_cost.toFixed(2)}</span>
			</div>
			<div class="result-item">
				<span class="label">New Monthly Payment:</span>
				<span class="value">${outputs.new_monthly_payment.toFixed(2)}</span>
			</div>
		</div>

		<div class="result-group highlight">
			<h3>Savings Analysis</h3>
			<div class="result-item">
				<span class="label">Monthly Savings:</span>
				<span class="value">${outputs.monthly_savings.toFixed(2)}</span>
			</div>
			<div class="result-item">
				<span class="label">Total Savings:</span>
				<span class="value">${outputs.total_savings.toFixed(2)}</span>
			</div>
			<div class="result-item">
				<span class="label">Months to Break Even:</span>
				<span class="value">{outputs.months_to_breakeven.toFixed(1)} months</span>
			</div>
		</div>
	</section>
</main>
