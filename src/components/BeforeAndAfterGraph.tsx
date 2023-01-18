import ReactApexChart from "react-apexcharts";
import { ILoanRepaymentInstalments } from "./LoanRepaymentCalculator";

function BeforeAndAfterGraph (
  beforeInstallments :ILoanRepaymentInstalments,
  afterInstallments :ILoanRepaymentInstalments) : JSX.Element
  {
    let beforeSeries:number[] = []
    let afterSeries:number[] = []

    let categories : number[] = [];

    for(let i = 0; i < beforeInstallments.installments.length; i++){
      categories.push(i);
      
      if(beforeInstallments && beforeInstallments.installments && beforeInstallments.installments.length > i){
        beforeSeries.push(beforeInstallments.installments[i].currentDebt)

  
        if(afterInstallments && afterInstallments.installments){
          if(afterInstallments.installments.length > i){
            afterSeries.push(afterInstallments.installments[i].currentDebt)
          }else{
            afterSeries.push(0)
          }
        }
      }
    }

    return <div className='graph'>
    <ReactApexChart options={{
          chart: {
            height: 350,
            type: 'area'
          },
          tooltip: {
            
            x: {
              formatter: function (seriesName) {
                let ano = Math.floor(seriesName/12);
                let mes = seriesName%12;
                return "Pagamento: " + seriesName + " - ano " + ano + " mês " + mes
              },
            },
          },
          markers: { size: 0,
            colors: undefined,
            strokeColors: '#fff',
            strokeWidth: 2,
            strokeOpacity: 0.9,
            strokeDashArray: 0,
            fillOpacity: 1,
            discrete: [],
            shape: "circle",
            radius: 2,
            offsetX: 0,
            offsetY: 0,
            onClick: undefined,
            onDblClick: undefined,
            showNullDataPoints: true,
            hover: {
              size: undefined,
              sizeOffset: 3
            }},
          xaxis: {
            type: 'numeric',
            categories: categories}
          }} series={[{
            name: 'Sem Amortização',
            data: beforeSeries
          }, {
            name: 'Com Amortização',
            data: afterSeries,
          }]} type="area" height={350} />
          </div>
  
  }

export { BeforeAndAfterGraph }
