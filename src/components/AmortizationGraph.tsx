import ReactApexChart from "react-apexcharts";
import { ILoanRepaymentInstalment } from "./LoanRepaymentCalculator";
import { axisPosition, balanceAfterMonths, Granularity, groupInstallments, periodLabel, positionText, sampleMonths } from "./ScheduleGrouping";

function roundToCents(num: number): number {
  return Math.round(num * 100) / 100;
}

function AmortizationGraph(installments: ILoanRepaymentInstalment[], granularity: Granularity): JSX.Element {
  const rows = groupInstallments(installments, 'month');

  // Index m holds the totals after m payments.
  const interestAfter: number[] = [0];
  const paidAfter: number[] = [0];
  for (const row of rows) {
    interestAfter.push(interestAfter[interestAfter.length - 1] + row.interest);
    paidAfter.push(paidAfter[paidAfter.length - 1] + row.payment + row.extraRepaymentValue + row.extraRepaymentTax);
  }

  const months = sampleMonths([rows.length], granularity);
  const periods = months.map(month => axisPosition(month, granularity));
  const balanceSeries = months.map(month => balanceAfterMonths(rows, month));
  const interestSeries = months.map(month => roundToCents(interestAfter[month]));
  const paymentSeries = months.map(month => roundToCents(paidAfter[month]));

  const label = periodLabel(granularity);

  return <div className='roundedBox'>
    <ReactApexChart options={{
                      chart: {
                        height: 350,
                        type: 'line'
                      },
                      stroke: {
                        width: 3,
                        curve: 'straight'
                      },
                      tooltip: {
                        x: {
                          formatter: function (position) {
                            return positionText(position, granularity)
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
                        decimalsInFloat: 0,
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
