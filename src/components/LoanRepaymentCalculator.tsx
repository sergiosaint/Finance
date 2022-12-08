interface ILoanRepaymentInstalment {
  installmentNumber: number
  currentDebt: number
  monthlyPayment: number
  interest: number
  extraRepaymentValue: number
  extraRepaymentTax: number
}

interface ILoanRepaymentInstalments {
  originalMonthlyPayment: number
  totalInterest: number
  totalTaxes: number
  installments: ILoanRepaymentInstalment[]
}

function RoundToTwoDecimalPlaces(num : number) : number{
  return Number(Math.round(Number(num + "e+2")) + "e-2");
}

function calculateRepaymentValue(debt:number, montlyInterest:number, numberOfPayments:number) : number {
  return (debt / ((1-Math.pow(1+(montlyInterest), -numberOfPayments))/montlyInterest));
}

function calculateInstallments (
  debt :number,
  anualInterest :number,
  numberOfPayments :number,
  startMonth : number,
  repaymentEveryXMonths : number,
  repaymentValue : number,
  repaymentTax : number,
  useSavings: boolean) : ILoanRepaymentInstalments
  {
  const montlyInterest = anualInterest/100/12;

  let originalMonthlyPayment = RoundToTwoDecimalPlaces(calculateRepaymentValue(debt, montlyInterest, numberOfPayments));

  let savings = 0;
  let totalInterest = 0;
  let totalTaxes = 0;

  const installments : ILoanRepaymentInstalment[] = [];
  for (let i = 0; i < numberOfPayments; i++) {
    let payment = RoundToTwoDecimalPlaces(calculateRepaymentValue(debt, montlyInterest, numberOfPayments - i));
    let interest = RoundToTwoDecimalPlaces(debt*montlyInterest);
    let repayment = RoundToTwoDecimalPlaces(payment-interest);

    savings += RoundToTwoDecimalPlaces(payment-originalMonthlyPayment);

    if(repayment > debt){
      repayment = debt;
      payment = repayment + interest;
    }

    let actualRepaymentValue = 0;
    let actualRepaymentTax = 0;

    if(debt-repayment > 0) {
      if(i >= startMonth && (i === startMonth || (i - startMonth) % repaymentEveryXMonths === 0)){
        if(useSavings){
          actualRepaymentValue = RoundToTwoDecimalPlaces(repaymentValue + savings);
          savings = 0;
        }else{
          actualRepaymentValue = repaymentValue
        }

        actualRepaymentValue  = RoundToTwoDecimalPlaces(actualRepaymentValue / (1+repaymentTax/100)) // prone to error, devo receber o valor a amortizar...
        actualRepaymentValue = RoundToTwoDecimalPlaces(Math.min(actualRepaymentValue, debt - repayment))
        actualRepaymentTax = RoundToTwoDecimalPlaces(actualRepaymentValue*repaymentTax/100)
      }
    }

    installments.push(
      {
        installmentNumber: i,
        currentDebt: debt,
        monthlyPayment: payment,
        interest: interest,
        extraRepaymentValue: actualRepaymentValue,
        extraRepaymentTax: actualRepaymentTax
      });

    debt = RoundToTwoDecimalPlaces(RoundToTwoDecimalPlaces(debt - repayment) - actualRepaymentValue); //Hack for proper math...

    totalInterest += interest
    totalTaxes += actualRepaymentTax

    if (debt === 0){
      break
    }
  }

  return { originalMonthlyPayment, totalInterest, totalTaxes, installments};
}

export default calculateInstallments