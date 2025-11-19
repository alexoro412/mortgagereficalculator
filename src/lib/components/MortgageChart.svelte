<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import type { ECharts } from 'echarts';
	import { formatCurrencyShort } from '$lib/utils/formatting';

	interface ChartDataPoint {
		month: number;
		value: number;
	}

	interface Props {
		currentMortgageData: ChartDataPoint[];
		refinanceData: ChartDataPoint[];
		isSavings: boolean;
	}

	let { currentMortgageData, refinanceData, isSavings }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: ECharts | null = null;

	// Function to create chart options
	function createChartOption(): echarts.EChartsOption {
		return {
			title: {
				text: 'Cumulative Payment Comparison',
				left: 'center',
				textStyle: {
					fontSize: 18,
					fontWeight: 'bold',
					color: '#111827'
				}
			},
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					const yearValue = params[0].axisValue;
					let result = `<strong>Year ${yearValue}</strong><br/>`;
					params.forEach((param: any) => {
						const value = param.value.toLocaleString('en-US', {
							style: 'currency',
							currency: 'USD',
							minimumFractionDigits: 0,
							maximumFractionDigits: 0
						});
						result += `${param.marker} ${param.seriesName}: ${value}<br/>`;
					});
					return result;
				}
			},
			legend: {
				data: ['Current Mortgage', 'Refinance'],
				bottom: 10,
				textStyle: {
					fontSize: 12
				}
			},
			grid: {
				left: '6%',
				right: '4%',
				bottom: '15%',
				top: '15%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: currentMortgageData.map((d) => Math.floor(d.month / 12)),
				name: 'Years from Start',
				nameLocation: 'middle',
				nameGap: 30,
				nameTextStyle: {
					fontSize: 12,
					fontWeight: 'bold'
				}
			},
			yAxis: {
				type: 'value',
				name: 'Cumulative Amount Paid',
				nameLocation: 'middle',
				nameGap: 50,
				nameTextStyle: {
					fontSize: 12,
					fontWeight: 'bold'
				},
				axisLabel: {
					formatter: (value: number) => {
						return formatCurrencyShort(value);
					}
				}
			},
			series: [
				{
					name: 'Current Mortgage',
					type: 'line',
					data: currentMortgageData.map((d) => d.value),
					smooth: true,
					symbol: 'none',
					lineStyle: {
						width: 3,
						color: '#3b82f6' // Blue
					},
					itemStyle: {
						color: '#3b82f6'
					},
					emphasis: {
						focus: 'series'
					}
				},
				{
					name: 'Refinance',
					type: 'line',
					data: refinanceData.map((d) => d.value),
					smooth: true,
					symbol: 'none',
					lineStyle: {
						width: 3,
						color: isSavings ? '#10b981' : '#ef4444' // Green if savings, red if cost
					},
					itemStyle: {
						color: isSavings ? '#10b981' : '#ef4444'
					},
					emphasis: {
						focus: 'series'
					}
				}
			]
		};
	}

	onMount(() => {
		// Initialize chart
		chart = echarts.init(chartContainer);
		chart.setOption(createChartOption());

		// Make chart responsive
		const resizeObserver = new ResizeObserver(() => {
			chart?.resize();
		});
		resizeObserver.observe(chartContainer);

		// Cleanup
		return () => {
			resizeObserver.disconnect();
			chart?.dispose();
			chart = null;
		};
	});

	// Update chart when props change
	$effect(() => {
		if (chart) {
			chart.setOption(createChartOption());
		}
	});
</script>

<div
	class="w-full rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2"
>
	<div bind:this={chartContainer} class="h-96"></div>
</div>
