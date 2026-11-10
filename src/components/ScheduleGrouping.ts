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

// Every period boundary plus each schedule's last month, so a partial final year is plotted at its real position.
function sampleMonths(scheduleLengths: number[], granularity: Granularity): number[] {
  const lastMonth = Math.max(0, ...scheduleLengths);
  if (lastMonth === 0) {
    return [];
  }

  const step = granularity === 'year' ? 12 : 1;
  const months = new Set<number>(scheduleLengths.filter(length => length > 0));
  for (let month = 0; month <= lastMonth; month += step) {
    months.add(month);
  }

  return Array.from(months).sort((a, b) => a - b);
}

function axisPosition(month: number, granularity: Granularity): number {
  return granularity === 'year' ? roundToCents(month / 12) : month;
}

function positionText(position: number, granularity: Granularity): string {
  if (granularity === 'month') {
    return `Mês ${position}`;
  }

  const totalMonths = Math.round(position * 12);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return months === 0 ? `Ano ${years}` : `Ano ${years} e ${months} ${months > 1 ? 'meses' : 'mês'}`;
}

function balanceAfterMonths(monthlyRows: IScheduleRow[], months: number): number {
  if (monthlyRows.length === 0 || months > monthlyRows.length) {
    return 0;
  }

  return months === 0 ? monthlyRows[0].startDebt : monthlyRows[months - 1].endDebt;
}

export { groupInstallments, periodLabel, sampleMonths, axisPosition, positionText, balanceAfterMonths }
export type { Granularity, IScheduleRow }
