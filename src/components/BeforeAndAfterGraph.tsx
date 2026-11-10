import ReactApexChart from "react-apexcharts";
import { Granularity, IScheduleRow, periodLabel } from "./ScheduleGrouping";

function BeforeAndAfterGraph (
  beforeRows :IScheduleRow[],
  afterRows :IScheduleRow[],
  granularity :Granularity) : JSX.Element
  {
    const categories : number[] = [];
    const beforeSeries : number[] = [];
    const afterSeries : number[] = [];

    if (beforeRows.length > 0) {
      categories.push(0);
      beforeSeries.push(beforeRows[0].startDebt);
      afterSeries.push(afterRows.length > 0 ? afterRows[0].startDebt : 0);
    }

    for (let i = 0; i < beforeRows.length; i++) {
      categories.push(i + 1);
      beforeSeries.push(beforeRows[i].endDebt);
      afterSeries.push(i < afterRows.length ? afterRows[i].endDebt : 0);
    }

    const label = periodLabel(granularity);

    return  <div className='roundedBox'>
              <ReactApexChart options={{
                              chart: {
                              height: 350,
                              type: 'area'
                              },
                              tooltip: {
                                x: {
                                  formatter: function (period) {
                                    return label + " " + period
                                  },
                               },
                              },
                              dataLabels: {
                                enabled: false,
                              },
                              xaxis: {
                                type: 'numeric',
                                categories: categories,
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
