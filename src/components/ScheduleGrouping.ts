import { ILoanRepaymentInstalment } from "./LoanRepaymentCalculator";

type Granularity = 'month' | 'year';

interface IScheduleRow {
  period: number
  startDebt: number
  payment: number
  interest: number
  principal: number
  extraRepaymentValue: number
  extraRepaymentTax: number
  endDebt: number
}

function roundToCents(num: number): number {
  return Math.round(num * 100) / 100;
}

function debtAfter(installments: ILoanRepaymentInstalment[], index: number): number {
  if (index + 1 < installments.length) {
    return installments[index + 1].currentDebt;
  }

  const last = installments[index];
  return Math.max(0, roundToCents(last.currentDebt - (last.monthlyPayment - last.interest) - last.extraRepaymentValue));
}

function groupInstallments(installments: ILoanRepaymentInstalment[], granularity: Granularity): IScheduleRow[] {
  const monthsPerPeriod = granularity === 'year' ? 12 : 1;
  const rows: IScheduleRow[] = [];

  for (let start = 0; start < installments.length; start += monthsPerPeriod) {
    const end = Math.min(start + monthsPerPeriod, installments.length) - 1;
    let payment = 0;
    let interest = 0;
    let principal = 0;
    let extraRepaymentValue = 0;
    let extraRepaymentTax = 0;

    for (let i = start; i <= end; i++) {
      const installment = installments[i];
      payment += installment.monthlyPayment;
      interest += installment.interest;
      principal += roundToCents(installment.monthlyPayment - installment.interest);
      extraRepaymentValue += installment.extraRepaymentValue;
      extraRepaymentTax += installment.extraRepaymentTax;
    }

    rows.push({
      period: rows.length + 1,
      startDebt: installments[start].currentDebt,
      payment: roundToCents(payment),
      interest: roundToCents(interest),
      principal: roundToCents(principal),
      extraRepaymentValue: roundToCents(extraRepaymentValue),
      extraRepaymentTax: roundToCents(extraRepaymentTax),
      endDebt: debtAfter(installments, end),
    });
  }

  return rows;
}

function periodLabel(granularity: Granularity): string {
  return granularity === 'year' ? 'Ano' : 'Mês';
}

export { groupInstallments, periodLabel }
export type { Granularity, IScheduleRow }
