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
</script>
