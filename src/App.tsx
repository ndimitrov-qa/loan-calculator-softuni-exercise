import { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  TrendingDown,
  Receipt,
  PiggyBank,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

interface ScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface LoanInputs {
  amount: string;
  rate: string;
  months: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function calculateSchedule(
  principal: number,
  annualRate: number,
  months: number
): { schedule: ScheduleRow[]; monthlyPayment: number; totalInterest: number } {
  const monthlyRate = annualRate / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment =
      (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  const schedule: ScheduleRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;

    schedule.push({
      month: m,
      payment: monthlyPayment,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  return { schedule, monthlyPayment, totalInterest };
}

function App() {
  const [inputs, setInputs] = useState<LoanInputs>({
    amount: '250000',
    rate: '6.5',
    months: '360',
  });
  const [hasCalculated, setHasCalculated] = useState(true);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const result = useMemo(() => {
    const principal = parseFloat(inputs.amount);
    const annualRate = parseFloat(inputs.rate);
    const months = parseInt(inputs.months, 10);

    if (
      isNaN(principal) ||
      isNaN(annualRate) ||
      isNaN(months) ||
      principal <= 0 ||
      annualRate < 0 ||
      months <= 0
    ) {
      return null;
    }

    return calculateSchedule(principal, annualRate, months);
  }, [inputs]);

  const totalPayment = result
    ? result.monthlyPayment * parseFloat(inputs.months)
    : 0;

  const handleInputChange = (field: keyof LoanInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setHasCalculated(false);
  };

  const handleCalculate = () => setHasCalculated(true);

  const handleReset = () => {
    setInputs({ amount: '', rate: '', months: '' });
    setHasCalculated(false);
  };

  const displaySchedule = result
    ? showFullSchedule
      ? result.schedule
      : result.schedule.slice(0, 12)
    : [];

  const principalPaid = result
    ? result.schedule.reduce((sum, r) => sum + r.principal, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Calculator className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Loan Calculator
            </h1>
            <p className="text-xs text-slate-500">
              Amortization schedule & payment breakdown
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Loan Details
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Enter your loan information to calculate payments
              </p>

              {/* Loan Amount */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loan Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs.amount}
                    onChange={(e) =>
                      handleInputChange('amount', e.target.value)
                    }
                    placeholder="250,000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Annual Interest Rate
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={inputs.rate}
                    onChange={(e) =>
                      handleInputChange('rate', e.target.value)
                    }
                    placeholder="6.5"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Loan Term */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loan Term (months)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={inputs.months}
                    onChange={(e) =>
                      handleInputChange('months', e.target.value)
                    }
                    placeholder="360"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-slate-300"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { label: '15 yr', value: 180 },
                    { label: '20 yr', value: 240 },
                    { label: '30 yr', value: 360 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() =>
                        handleInputChange('months', String(preset.value))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        inputs.months === String(preset.value)
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCalculate}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {!result || !hasCalculated ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {hasCalculated
                    ? 'Enter valid loan details'
                    : 'Your results will appear here'}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Fill in the loan amount, interest rate, and term on the left,
                  then click Calculate to see your monthly payment and full
                  repayment schedule.
                </p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-600/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Receipt className="w-4 h-4 text-blue-100" />
                      <span className="text-xs font-medium text-blue-100 uppercase tracking-wide">
                        Monthly Payment
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(result.monthlyPayment)}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Total Interest
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(result.totalInterest)}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <PiggyBank className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Total Repayment
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(totalPayment)}
                    </p>
                  </div>
                </div>

                {/* Principal vs Interest Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">
                    Principal vs Interest
                  </h3>
                  <div className="flex h-8 rounded-lg overflow-hidden shadow-sm">
                    <div
                      className="bg-blue-600 flex items-center justify-center text-xs font-semibold text-white transition-all duration-500"
                      style={{
                        width: `${(principalPaid / totalPayment) * 100}%`,
                      }}
                    >
                      {((principalPaid / totalPayment) * 100).toFixed(0)}%
                    </div>
                    <div
                      className="bg-amber-400 flex items-center justify-center text-xs font-semibold text-amber-900 transition-all duration-500"
                      style={{
                        width: `${(result.totalInterest / totalPayment) * 100}%`,
                      }}
                    >
                      {((result.totalInterest / totalPayment) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-600" />
                      <span className="text-xs text-slate-600">
                        Principal {formatCurrency(principalPaid)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-amber-400" />
                      <span className="text-xs text-slate-600">
                        Interest {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amortization Schedule */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Repayment Schedule
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {result.schedule.length} payments over{' '}
                        {inputs.months} months
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                          <th className="px-5 py-3 text-left font-semibold">
                            Month
                          </th>
                          <th className="px-5 py-3 text-right font-semibold">
                            Payment
                          </th>
                          <th className="px-5 py-3 text-right font-semibold">
                            Principal
                          </th>
                          <th className="px-5 py-3 text-right font-semibold">
                            Interest
                          </th>
                          <th className="px-5 py-3 text-right font-semibold">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displaySchedule.map((row, idx) => (
                          <tr
                            key={row.month}
                            className={`transition-colors hover:bg-blue-50/40 ${
                              idx % 2 === 1 ? 'bg-slate-50/30' : ''
                            }`}
                          >
                            <td className="px-5 py-3 font-medium text-slate-700">
                              {row.month}
                            </td>
                            <td className="px-5 py-3 text-right text-slate-900 font-medium tabular-nums">
                              {formatCurrency(row.payment)}
                            </td>
                            <td className="px-5 py-3 text-right text-blue-600 font-medium tabular-nums">
                              {formatCurrency(row.principal)}
                            </td>
                            <td className="px-5 py-3 text-right text-amber-600 font-medium tabular-nums">
                              {formatCurrency(row.interest)}
                            </td>
                            <td className="px-5 py-3 text-right text-slate-700 tabular-nums">
                              {formatCurrency(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {result.schedule.length > 12 && (
                    <button
                      onClick={() => setShowFullSchedule(!showFullSchedule)}
                      className="w-full px-5 py-3.5 border-t border-slate-100 text-sm font-medium text-blue-600 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
                    >
                      {showFullSchedule
                        ? 'Show first 12 months'
                        : `Show all ${result.schedule.length} months`}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          showFullSchedule ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
