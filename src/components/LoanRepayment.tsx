import React from 'react';
import calculateInstallments from './LoanRepaymentCalculator';

interface ILoanRepaymentProps {
  mixesForWave: number
}

function RoundToTwoDecimalPlaces(num : number) : number{
  return Number(Math.round(Number(num + "e+2")) + "e-2");
}

function savedTimeText(months: number) : string {
  const savedYears = Math.floor(months/12);
  const savedMonths = months % 12;

  if(months === 0){
    return "Prazo de pagamento mantevese igual"
  }

  let result = "Pagamento antecipado em ";
  if(savedYears > 0){
    result += `${savedYears} ${savedYears > 1 ? 'anos' : 'ano'}` 
  }

  if(savedYears > 0 && savedMonths > 0){
    result += ` e ` 
  }

  if(savedMonths > 0){
    result += `${savedMonths} ${savedMonths > 1 ? 'meses' : 'mes'}` 
  }

  return result;
}

function getResults(
  stringDebt :string,
  stringYearInterest :string,
  stringNumberOfPayments :string,
  stringStartMonth : string,
  stringRepaymentEveryXMonths : string,
  stringRepaymentValue : string,
  stringRepaymentTax : string) : JSX.Element
  {
  let debt = parseFloat(stringDebt);
  const anualInterest = parseFloat(stringYearInterest);
  const numberOfPayments = parseFloat(stringNumberOfPayments);
  const startMonth = parseFloat(stringStartMonth);
  const repaymentEveryXMonths = parseFloat(stringRepaymentEveryXMonths);
  const repaymentValue = parseFloat(stringRepaymentValue);
  const repaymentTax = parseFloat(stringRepaymentTax);

  let afterInstallments = calculateInstallments(debt, anualInterest, numberOfPayments, startMonth, repaymentEveryXMonths, repaymentValue, repaymentTax, false)
  let beforeInstallments = calculateInstallments(debt, anualInterest, numberOfPayments, 0, 0, 0, 0, false)

  const savedMonths = beforeInstallments.installments.length-afterInstallments.installments.length

  return (
    <>
      <div>
      Total antes: {beforeInstallments.totalInterest}
      Total depois: {`${RoundToTwoDecimalPlaces(afterInstallments.totalInterest + afterInstallments.totalTaxes)} (${afterInstallments.totalInterest} + ${afterInstallments.totalTaxes})`}
      poupanca: {RoundToTwoDecimalPlaces(beforeInstallments.totalInterest - RoundToTwoDecimalPlaces(afterInstallments.totalInterest + afterInstallments.totalTaxes))}
      {savedTimeText(savedMonths)})
      {}
      </div>
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
          {calculateInstallments(debt, anualInterest, numberOfPayments, startMonth, repaymentEveryXMonths, repaymentValue, repaymentTax, false)
          .installments.map(installment =>
          <tr key={`"${installment.installmentNumber}"`}>
            <th>{installment.installmentNumber+1}</th>
            <th>{installment.currentDebt}</th>
            <th>{installment.monthlyPayment}{installment.extraRepaymentValue > 0 && `+(${RoundToTwoDecimalPlaces(installment.extraRepaymentValue+installment.extraRepaymentTax)})`}</th>
            <th>{installment.interest}</th>
            <th>{RoundToTwoDecimalPlaces(installment.monthlyPayment-installment.interest)}</th>
            <th>{installment.extraRepaymentValue}</th>
            <th>{installment.extraRepaymentTax}</th>
          </tr>)}
        </tbody>
      </table>
    </>)
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
        {getResults(debt, interest, numberOfPayments, startMonth, repaymentEveryXMonths, repaymentValue, repaymentTax)}
      </>
  )
}

export default LoanRepayment