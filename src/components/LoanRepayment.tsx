import React from 'react';

interface ILoanRepaymentProps {
  mixesForWave: number
}

function RoundToTwoDecimalPlaces(num : number) : number{
  return Number(Math.round(Number(num + "e+2")) + "e-2");
}

// function calculateRepaymentValue(stringDebt:string, stringYearInterest:string, stringNumberOfPayments:string) : number {
//   const debt = parseFloat(stringDebt);
//   const montlyInterest = parseFloat(stringYearInterest)/100/12;
//   const numberOfPayments = parseFloat(stringNumberOfPayments);

//   return (debt / ((1-Math.pow(1+(montlyInterest), -numberOfPayments))/montlyInterest)) - debt* montlyInterest;
// }

function calculateRepaymentValue2(debt:number, montlyInterest:number, numberOfPayments:number) : number {
  return (debt / ((1-Math.pow(1+(montlyInterest), -numberOfPayments))/montlyInterest));
}

function getResultRows(
  stringDebt :string,
  stringYearInterest :string,
  stringNumberOfPayments :string,
  stringStartMonth : string,
  stringRepaymentEveryXMonths : string,
  stringRepaymentValue : string,
  stringRepaymentTax : string) : JSX.Element[]
  {
  let debt = parseFloat(stringDebt);
  const montlyInterest = parseFloat(stringYearInterest)/100/12;
  const numberOfPayments = parseFloat(stringNumberOfPayments);
  const startMonth = parseFloat(stringStartMonth);
  const repaymentEveryXMonths = parseFloat(stringRepaymentEveryXMonths);
  const repaymentValue = parseFloat(stringRepaymentValue);
  const repaymentTax = parseFloat(stringRepaymentTax);

  //let interestSoFar = 0;
  //let taxesSoFar = 0;

  const result : JSX.Element[] = [];
  for (let i = 0; i < numberOfPayments; i++) {
    let payment = RoundToTwoDecimalPlaces(calculateRepaymentValue2(debt, montlyInterest, numberOfPayments - i))
    let interest = RoundToTwoDecimalPlaces(debt*montlyInterest)
    let repayment = RoundToTwoDecimalPlaces(payment-interest)

    if(repayment > debt){
      repayment = debt;
      payment = repayment + interest;
    }

    let actualRepaymentValue = 0;
    let actualRepaymentTax = 0

    if(debt-repayment > 0) {
      if(i >= startMonth && (i === startMonth || (i - startMonth) % repaymentEveryXMonths === 0)){
        actualRepaymentValue  = RoundToTwoDecimalPlaces(repaymentValue / (1+repaymentTax/100)) // prone to error, devo receber o valor a amortizar...
        actualRepaymentValue = RoundToTwoDecimalPlaces(Math.min(actualRepaymentValue, debt - repayment))
        actualRepaymentTax = RoundToTwoDecimalPlaces(actualRepaymentValue*repaymentTax/100)
      }
    }

    result.push(
    <tr key={`"${i}"`}>
    <th>{i+1}</th>
    <th>{debt}</th>
    <th>{payment}{actualRepaymentValue > 0 && `+(${RoundToTwoDecimalPlaces(actualRepaymentValue+actualRepaymentTax)})`}</th>
    <th>{interest}</th>
    <th>{repayment}</th>
    <th>{actualRepaymentValue}</th>
    <th>{actualRepaymentTax}</th>
    </tr>);

    debt = RoundToTwoDecimalPlaces(RoundToTwoDecimalPlaces(debt - repayment) - actualRepaymentValue); //Hack for proper math...

    //interestSoFar += interest
    //taxesSoFar += actualRepaymentTax

    if (debt === 0){
      break
    }
  }

  return result;
}

function LoanRepayment(props: ILoanRepaymentProps) {
  const [debt, setDebt] = React.useState("0");
  const [interest, setInterest] = React.useState("0");
  const [repaymentValue, setRepaymentValue] = React.useState("0");
  const [repaymentTax, setRepaymentTax] = React.useState("0.5");
  const [numberOfPayments, setNumberOfPayments] = React.useState("");
  const [repaymentEveryXMonths, setRepaymentEveryXMonths] = React.useState("0");
  const [startMonth, setStartMonth] = React.useState("0");
  

  const onAmountChange = (e:any, set: any) => {
    debugger
    const amount = e.target.value;

    if (!amount || amount.match(/^\d{1,}(\.\d{0,4})?$/)) {
      set(amount);
    }
  };

  return (

      <>
        <h2>Calculo de amortização antecipada</h2>

        <form className='demoForm'>
          <div className='form-group'>

            <label htmlFor='debt'>Valor em dívida</label>
            <input type='text'
                   className='form-control'
                   name='debt'
                   value={debt}
                   onChange={e => onAmountChange(e, setDebt)}
            />

            <label htmlFor='interest'>Taxa de juro</label>
            <input type='text'
                   className='form-control'
                   name='interest'
                   value={interest}
                   onChange={e => setInterest(e.target.value)}
            />

            <label htmlFor='numberOfPayments'>Prestações mensais em falta</label>
            <input type='text'
                   className='form-control'
                   name='numberOfPayments'
                   value={numberOfPayments}
                   onChange={e => setNumberOfPayments(e.target.value)}
            />

            <label htmlFor='repaymentValue'>Valor a despender</label>
            <input type='text'
                   className='form-control'
                   name='repaymentValue'
                   value={repaymentValue}
                   onChange={e => setRepaymentValue(e.target.value)}
            />

            <label htmlFor='repaymentTax'>Taxa de amortização</label>
            <input type='text'
                   className='form-control'
                   name='repaymentTax'
                   value={repaymentTax}
                   onChange={e => setRepaymentTax(e.target.value)}
            />

            <label htmlFor='repaymentEveryXMonths'>Pagamentos de x em x meses</label>
            <input type='text'
                   className='form-control'
                   name='repaymentEveryXMonths'
                   value={repaymentEveryXMonths}
                   onChange={e => setRepaymentEveryXMonths(e.target.value)}
            />

            <label htmlFor='startMonth'>Começar em x meses</label>
            <input type='text'
                   className='form-control'
                   name='startMonth'
                   value={startMonth}
                   onChange={e => setStartMonth(e.target.value)}
            />
          </div>

        </form>

        Resultados
        <table className="table table-striped table h6-sm mb-0">
          <tbody>
            <tr>
	            <th>#</th>
	            <th>Divida</th>
	            <th>Pagamento</th>
              <th>Juro</th>
              <th>Amortizado</th>
              <th>Amortizado Extra</th>
              <th>Taxa de amortizacao Extra</th>
	          </tr>
            {getResultRows(debt, interest, numberOfPayments, startMonth, repaymentEveryXMonths, repaymentValue, repaymentTax)}
          </tbody>
        </table>
      </>
  )
}

export default LoanRepayment