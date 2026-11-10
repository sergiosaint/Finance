import ReactApexChart from "react-apexcharts";
import { Granularity, IScheduleRow, periodLabel } from "./ScheduleGrouping";

function roundToCents(num: number): number {
  return Math.round(num * 100) / 100;
}

function AmortizationGraph(rows: IScheduleRow[], granularity: Granularity): JSX.Element {
  const periods: number[] = [];
  const balanceSeries: number[] = [];
  const interestSeries: number[] = [];
  const paymentSeries: number[] = [];

  if (rows.length > 0) {
    periods.push(0);
    balanceSeries.push(rows[0].startDebt);
    interestSeries.push(0);
    paymentSeries.push(0);
  }

  let totalInterest = 0;
  let totalPaid = 0;

  for (const row of rows) {
    totalInterest += row.interest;
    totalPaid += row.payment + row.extraRepaymentValue + row.extraRepaymentTax;

    periods.push(row.period);
    balanceSeries.push(row.endDebt);
    interestSeries.push(roundToCents(totalInterest));
    paymentSeries.push(roundToCents(totalPaid));
  }

  const label = periodLabel(granularity);

  return <div className='roundedBox'>
    <ReactApexChart options={{
                      chart: {
                        height: 350,
                        type: 'line'
                      },
                      stroke: {
                        width: 3
                      },
                      tooltip: {
                        x: {
                          formatter: function (period) {
                            return label + " " + period
                          },
                        },
                        y: {
                          formatter: function (value) {
                            return value.toFixed(2) + "€"
                          },
                        },
                      },
                      dataLabels: {
                        enabled: false,
                      },
                      xaxis: {
                        type: 'numeric',
                        categories: periods,
                        title: { text: label }
                      },
                      yaxis: {
                        labels: {
                          formatter: function (value) {
                            return Math.round(value) + "€"
                          },
                        },
                      },
                    }} series={[{
                      name: 'Dívida',
                      data: balanceSeries
                    }, {
                      name: 'Juros',
                      data: interestSeries
                    }, {
                      name: 'Pagamentos',
                      data: paymentSeries
                    }]}
                    type="line"
                    height={350} />
  </div>
}

export { AmortizationGraph }
