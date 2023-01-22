import React, { useEffect } from 'react';
import {calculateInstallments, ILoanRepaymentInstalments } from './LoanRepaymentCalculator';
import '../LoanRepayment.css'
import { BeforeAndAfterGraph } from './BeforeAndAfterGraph';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

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
    return "Prazo de pagamento mantém-se igual"
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
  beforeInstallments: ILoanRepaymentInstalments,
  afterInstallments: ILoanRepaymentInstalments,
  //stringDebt :string,
  //stringYearInterest :string,
  stringNumberOfPayments :string,
  stringStartMonth : string,
  stringRepaymentEveryXMonths : string,
  stringRepaymentValue : string,
  //stringRepaymentTax : string,
  //useSavings: boolean
  ) : JSX.Element
  {
  //let debt = parseFloat(stringDebt);
  const numberOfPayments = parseFloat(stringNumberOfPayments);
  const startMonth = parseFloat(stringStartMonth);
  const repaymentEveryXMonths = parseFloat(stringRepaymentEveryXMonths);
  const repaymentValue = parseFloat(stringRepaymentValue);

  const savedMonths = beforeInstallments.installments.length-afterInstallments.installments.length
  const afterTaxCosts = RoundToTwoDecimalPlaces(afterInstallments.totalInterest + afterInstallments.totalTaxes)
  const savedMoney = RoundToTwoDecimalPlaces(beforeInstallments.totalInterest - afterTaxCosts)


  return (
    <div className='results'>
      <div className='text'>
        Total em juros{repaymentValue !== 0 && <> antes</>}: {beforeInstallments.totalInterest}€<br/>
        {repaymentValue !== 0 &&
        <>Total em juros e taxas depois: {`${afterTaxCosts}€ (${afterInstallments.totalInterest} + ${afterInstallments.totalTaxes})`}<br/>
        poupanca: {savedMoney}€<br/>
        {repaymentEveryXMonths === 0 && false && <>Equivalente a colocar os {repaymentValue}€ a {RoundToTwoDecimalPlaces((savedMoney/(numberOfPayments-startMonth))*100/repaymentValue*12)}% de juro anual durante os restantes {numberOfPayments-startMonth} meses. (sem reinvestir os juros anuais)<br/></>}
        
        {savedTimeText(savedMonths)}<br/></>}
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
            <th>Taxa de amortização Extra</th>
          </tr>
          {afterInstallments.installments.map(installment =>
          <tr key={`"${installment.installmentNumber}"`}>
            <td>{installment.installmentNumber+1}</td>
            <td>{installment.currentDebt}</td>
            <td>{installment.monthlyPayment}{installment.extraRepaymentValue > 0 && `+(${RoundToTwoDecimalPlaces(installment.extraRepaymentValue+installment.extraRepaymentTax)})`}</td>
            <td>{installment.interest}</td>
            <td>{RoundToTwoDecimalPlaces(installment.monthlyPayment-installment.interest)}</td>
            <td>{installment.extraRepaymentValue}</td>
            <td>{installment.extraRepaymentTax}</td>
          </tr>)}
        </tbody>
      </table>
    </div>)
}

function LoanRepayment(props: ILoanRepaymentProps) {
  const [debt, setDebt] = React.useState("0");
  const [interest, setInterest] = React.useState("0");
  const [repaymentValue, setRepaymentValue] = React.useState("0");
  const [repaymentTax, setRepaymentTax] = React.useState("0.5");
  const [numberOfPayments, setNumberOfPayments] = React.useState("");
  const [repaymentEveryXMonths, setRepaymentEveryXMonths] = React.useState("0");
  const [startMonth, setStartMonth] = React.useState("0");
  const [useSavings, setUseSavings] = React.useState(false);
  
  const [beforeInstallments, setBeforeInstallments] = React.useState<ILoanRepaymentInstalments>({originalMonthlyPayment: 0, totalInterest: 0, totalTaxes: 0, installments: []})
  const [afterInstallments, setAfterInstallments] = React.useState<ILoanRepaymentInstalments>({originalMonthlyPayment: 0, totalInterest: 0, totalTaxes: 0, installments: []})
  

  const onAmountChange = (e:any, set: any) => {
    const amount = e.target.value;

    if (!amount || amount.match(/^\d{1,}(\.\d{0,4})?$/)) {
      set(amount);
    }
  };

  const onIntegerAmountChange = (e:any, set: any) => {
    const amount = e.target.value;

    if (!amount || amount.match(/^\d{0,3}$/)) {
      set(amount);
    }
  };

  const handleChangeUseSavings = () => {
    setUseSavings(!useSavings);
  };

  useEffect(() => {
    const ndebt = parseFloat(debt);
    const nanualInterest = parseFloat(interest);
    const nnumberOfPayments = parseFloat(numberOfPayments);
    const nstartMonth = parseFloat(startMonth);
    const nrepaymentEveryXMonths = parseFloat(repaymentEveryXMonths);
    const nrepaymentValue = parseFloat(repaymentValue);
    const nrepaymentTax = parseFloat(repaymentTax);

  setAfterInstallments(calculateInstallments(ndebt, nanualInterest, nnumberOfPayments, nstartMonth, nrepaymentEveryXMonths, nrepaymentValue, nrepaymentTax, useSavings))
  setBeforeInstallments(calculateInstallments(ndebt, nanualInterest, nnumberOfPayments, 0, 0, 0, 0, false))
  },[debt, interest, numberOfPayments, startMonth, repaymentEveryXMonths, repaymentValue, repaymentTax, useSavings])

  return (

      <>
        <h2 className='title'>Calculo de amortização antecipada</h2>

        <div className='roundedBox'>
          <form className='demoForm'>
            <div className='form-group'>

              <label htmlFor='debt'>Valor em dívida</label>
              <div className="input-group">
                <input type='text'
                       className='form-control'
                       name='debt'
                       value={debt}
                       onChange={e => onAmountChange(e, setDebt)}
                />
                <span className="input-group-text"> € </span>
              </div>

              <label htmlFor='interest' className='labelSpacing'>Taxa de juro anual</label>
              <div className="input-group">
                <input type='text'
                       className='form-control'
                       name='interest'
                       value={interest}
                       onChange={e => onAmountChange(e, setInterest)}
                />
                <span className="input-group-text"> % </span>
              </div>

              <label htmlFor='numberOfPayments' className='labelSpacing'>Prestações mensais em falta</label>
              <div className="input-group">
                <input type='text'
                       className='form-control'
                       name='numberOfPayments'
                       value={numberOfPayments}
                       onChange={e => onIntegerAmountChange(e, setNumberOfPayments)}
                />
                <span className="input-group-text"> # </span>
              </div>

              <label htmlFor='repaymentValue' className='labelSpacing'>Valor a despender</label>
              <div className="input-group">
                <input type='text'
                       className='form-control'
                       name='repaymentValue'
                       value={repaymentValue}
                       onChange={e => onAmountChange(e, setRepaymentValue)}
                />
                <span className="input-group-text"> € </span>
              </div>

              <OverlayTrigger
                overlay={<Tooltip id="button-tooltip" {...props}>
                Taxa aplicada ao valor de cada amortização. Normalmente 0.5% para taxa variável e 2% para taxa fixa. No entanto durante o ano de 2023 será 0%.
              </Tooltip>}
                placement="top"
                delay={{ show: 250, hide: 300 }}
              >
                <div>
                  <label htmlFor='repaymentTax' className='labelSpacing'>Taxa de amortização</label>
                  <div className="input-group">
                    <input type='text'
                           className='form-control'
                           name='repaymentTax'
                           value={repaymentTax}
                           onChange={e => onAmountChange(e, setRepaymentTax)}
                    />
                    <span className="input-group-text"> % </span>
                  </div>
                </div>
              </OverlayTrigger>

              <label htmlFor='repaymentEveryXMonths' className='labelSpacing'>Pagamentos de x em x meses</label>
              <div className="input-group">
                <input type='text'
                      className='form-control'
                      name='repaymentEveryXMonths'
                      value={repaymentEveryXMonths}
                      onChange={e => onIntegerAmountChange(e, setRepaymentEveryXMonths)}
                />
                <span className="input-group-text"> # </span>
              </div>

              <label htmlFor='startMonth' className='labelSpacing'>Começar em x meses</label>
              <div className='input-group'>
                <input type='text'
                       className='form-control'
                       name='startMonth'
                       value={startMonth}
                       onChange={e => onIntegerAmountChange(e, setStartMonth)}
                />
                <span className="input-group-text"> # </span>
              </div>

              <OverlayTrigger
                overlay={<Tooltip id="button-tooltip" {...props}>
                Após cada amortização o valor da mensalidade do crédito é reduzida. Pretende acumular esse valor e juntar ao valor a despender?
              </Tooltip>}
                placement="top"
                delay={{ show: 250, hide: 300 }}
              >
                <div>
                  <label htmlFor='useSavings' className='labelSpacing'>Usar poupanças</label>
                  <input type='checkbox'
                    name='useSavings'
                    checked={useSavings}
                    onChange={handleChangeUseSavings}
                  />
                </div>
              </OverlayTrigger>
            </div>
          </form>
        </div>

        {getResults(beforeInstallments, afterInstallments, numberOfPayments, startMonth, repaymentEveryXMonths, repaymentValue)}

        {BeforeAndAfterGraph(beforeInstallments, afterInstallments)}
      </>
  )
}

export default LoanRepayment