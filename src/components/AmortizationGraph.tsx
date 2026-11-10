import ReactApexChart from "react-apexcharts";
import { ILoanRepaymentInstalments } from "./LoanRepaymentCalculator";

function roundToCents(num: number): number {
  return Math.round(num * 100) / 100;
}

function AmortizationGraph(loan: ILoanRepaymentInstalments): JSX.Element {
  const installments = loan.installments;

  const years: number[] = [];
  const balanceSeries: number[] = [];
  const interestSeries: number[] = [];
  const paymentSeries: number[] = [];

  if (installments.length > 0) {
    years.push(0);
    balanceSeries.push(installments[0].currentDebt);
    interestSeries.push(0);
    paymentSeries.push(0);
  }

  let totalInterest = 0;
  let totalPaid = 0;

  for (let i = 0; i < installments.length; i++) {
    const installment = installments[i];
    totalInterest += installment.interest;
    totalPaid += installment.monthlyPayment + installment.extraRepaymentValue + installment.extraRepaymentTax;

    const isLast = i === installments.length - 1;
    if ((i + 1) % 12 === 0 || isLast) {
      years.push(Math.ceil((i + 1) / 12));
      balanceSeries.push(isLast ? 0 : installments[i + 1].currentDebt);
      interestSeries.push(roundToCents(totalInterest));
      paymentSeries.push(roundToCents(totalPaid));
    }
  }

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
                          formatter: function (year) {
                            return "Ano " + year
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
                        categories: years,
                        title: { text: 'Ano' }
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
