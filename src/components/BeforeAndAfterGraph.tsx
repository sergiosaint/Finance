import ReactApexChart from "react-apexcharts";
import { ILoanRepaymentInstalment } from "./LoanRepaymentCalculator";
import { axisPosition, balanceAfterMonths, Granularity, groupInstallments, periodLabel, positionText, sampleMonths } from "./ScheduleGrouping";

function BeforeAndAfterGraph (
  beforeInstallments :ILoanRepaymentInstalment[],
  afterInstallments :ILoanRepaymentInstalment[],
  granularity :Granularity) : JSX.Element
  {
    const beforeRows = groupInstallments(beforeInstallments, 'month');
    const afterRows = groupInstallments(afterInstallments, 'month');
    const months = sampleMonths([beforeRows.length, afterRows.length], granularity);

    const categories = months.map(month => axisPosition(month, granularity));
    const beforeSeries = months.map(month => balanceAfterMonths(beforeRows, month));
    const afterSeries = months.map(month => balanceAfterMonths(afterRows, month));

    const label = periodLabel(granularity);

    return  <div className='roundedBox'>
              <ReactApexChart options={{
                              chart: {
                              height: 350,
                              type: 'area'
                              },
                              stroke: {
                                curve: 'straight'
                              },
                              tooltip: {
                                x: {
                                  formatter: function (position) {
                                    return positionText(position, granularity)
                                  },
                               },
                              },
                              dataLabels: {
                                enabled: false,
                              },
                              xaxis: {
                                type: 'numeric',
                                categories: categories,
                                decimalsInFloat: 0,
                                title: { text: label }}
                              }} series={[{
                                name: 'Sem Amortização',
                                data: beforeSeries
                              }, {
                                name: 'Com Amortização',
                                data: afterSeries,
                              }]}
                              type="area"
                              height={350} />
            </div>
  
  }

export { BeforeAndAfterGraph }
