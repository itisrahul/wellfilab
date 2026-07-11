'use client';
import dynamic from 'next/dynamic';
export { CalcActions } from './CalcActions';


const loading = () => (
  <div className="flex items-center justify-center p-16 text-gray-400">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
      <p className="text-sm">Loading calculator…</p>
    </div>
  </div>
);

const WIDGETS: Record<string, React.ComponentType> = {
  // ── Health ────────────────────────────────────────
  'bmi':             dynamic(() => import('@/components/tools/widgets/health/BMICalc'),           { loading, ssr: false }),
  'ideal-weight':    dynamic(() => import('@/components/tools/widgets/health/IdealWeightCalc'),   { loading, ssr: false }),
  'body-fat':        dynamic(() => import('@/components/tools/widgets/health/BodyFatCalc'),       { loading, ssr: false }),
  'weight-loss':     dynamic(() => import('@/components/tools/widgets/health/WeightLossCalc'),   { loading, ssr: false }),
  'calories':        dynamic(() => import('@/components/tools/widgets/health/CalorieCalc'),       { loading, ssr: false }),
  'water':           dynamic(() => import('@/components/tools/widgets/health/WaterCalc'),         { loading, ssr: false }),
  'macros':          dynamic(() => import('@/components/tools/widgets/health/MacroCalc'),         { loading, ssr: false }),
  'heart-rate':      dynamic(() => import('@/components/tools/widgets/health/HeartRateCalc'),     { loading, ssr: false }),
  'calories-burned': dynamic(() => import('@/components/tools/widgets/health/CalBurnedCalc'),     { loading, ssr: false }),
  'steps':           dynamic(() => import('@/components/tools/widgets/health/StepsCalc'),         { loading, ssr: false }),
  'sleep':           dynamic(() => import('@/components/tools/widgets/health/SleepCalc'),         { loading, ssr: false }),
  'age':             dynamic(() => import('@/components/tools/widgets/health/AgeCalc'),           { loading, ssr: false }),
  'due-date':        dynamic(() => import('@/components/tools/widgets/health/DueDateCalc'),       { loading, ssr: false }),
  // ── Finance ───────────────────────────────────────
  'compound':        dynamic(() => import('@/components/tools/widgets/finance/CompoundCalc'),     { loading, ssr: false }),
  'sip':             dynamic(() => import('@/components/tools/widgets/finance/SIPCalc'),          { loading, ssr: false }),
  'savings-goal':    dynamic(() => import('@/components/tools/widgets/finance/SavingsGoalCalc'), { loading, ssr: false }),
  'investment-goal': dynamic(() => import('@/components/tools/widgets/finance/InvGoalCalc'),      { loading, ssr: false }),
  'loan':            dynamic(() => import('@/components/tools/widgets/finance/LoanCalc'),         { loading, ssr: false }),
  'mortgage':        dynamic(() => import('@/components/tools/widgets/finance/LoanCalc'),         { loading, ssr: false }),
  'debt-payoff':     dynamic(() => import('@/components/tools/widgets/finance/DebtPayoffCalc'),   { loading, ssr: false }),
  'retirement':      dynamic(() => import('@/components/tools/widgets/finance/RetirementCalc'),   { loading, ssr: false }),
  'fire':            dynamic(() => import('@/components/tools/widgets/finance/FIRECalc'),         { loading, ssr: false }),
  'budget':          dynamic(() => import('@/components/tools/widgets/finance/BudgetCalc'),       { loading, ssr: false }),
  'net-worth':       dynamic(() => import('@/components/tools/widgets/finance/NetWorthCalc'),     { loading, ssr: false }),
  'money-last':      dynamic(() => import('@/components/tools/widgets/finance/MoneyLastCalc'),    { loading, ssr: false }),
  'income-tax':      dynamic(() => import('@/components/tools/widgets/finance/IncomeTaxCalc'),    { loading, ssr: false }),
  'salary':          dynamic(() => import('@/components/tools/widgets/finance/SalaryCalc'),       { loading, ssr: false }),
  'gst':             dynamic(() => import('@/components/tools/widgets/finance/GSTCalc'),          { loading, ssr: false }),
  'currency':        dynamic(() => import('@/components/tools/widgets/finance/CurrencyCalc'),     { loading, ssr: false }),
  'inflation':       dynamic(() => import('@/components/tools/widgets/finance/InflationCalc'),    { loading, ssr: false }),
  'tip':             dynamic(() => import('@/components/tools/widgets/finance/TipCalc'),          { loading, ssr: false }),
  'rent-buy':       dynamic(() => import('@/components/tools/widgets/finance/RentBuyCalc'),        { loading, ssr: false }),
  'epf':            dynamic(() => import('@/components/tools/widgets/finance/EPFCalc'),            { loading, ssr: false }),
  'one-rm':         dynamic(() => import('@/components/tools/widgets/health/OneRMCalc'),          { loading, ssr: false }),
  'blood-pressure': dynamic(() => import('@/components/tools/widgets/health/BloodPressureCalc'),   { loading, ssr: false }),
  'fd-vs-mf':       dynamic(() => import('@/components/tools/widgets/finance/FDvsMFCalc'),          { loading, ssr: false }),
  // ── New calculators (36 → 60 expansion) ────────────
  // Finance — Grow Money
  'fd':              dynamic(() => import('@/components/tools/widgets/finance/FDCalc'),            { loading, ssr: false }),
  'rd':              dynamic(() => import('@/components/tools/widgets/finance/RDCalc'),            { loading, ssr: false }),
  'ppf':             dynamic(() => import('@/components/tools/widgets/finance/PPFCalc'),           { loading, ssr: false }),
  // Finance — Borrow Money
  'car-loan':        dynamic(() => import('@/components/tools/widgets/finance/CarLoanCalc'),       { loading, ssr: false }),
  'personal-loan':   dynamic(() => import('@/components/tools/widgets/finance/PersonalLoanCalc'),  { loading, ssr: false }),
  // Finance — Plan Ahead
  'lean-fire':       dynamic(() => import('@/components/tools/widgets/finance/LeanFIRECalc'),      { loading, ssr: false }),
  'coast-fire':      dynamic(() => import('@/components/tools/widgets/finance/CoastFIRECalc'),     { loading, ssr: false }),
  'emergency-fund':  dynamic(() => import('@/components/tools/widgets/finance/EmergencyFundCalc'), { loading, ssr: false }),
  // Finance — Tax & Pay
  'hra':             dynamic(() => import('@/components/tools/widgets/finance/HRACalc'),           { loading, ssr: false }),
  'capital-gains':   dynamic(() => import('@/components/tools/widgets/finance/CapitalGainsCalc'),  { loading, ssr: false }),
  'take-home-salary':dynamic(() => import('@/components/tools/widgets/finance/TakeHomeCalc'),      { loading, ssr: false }),
  // Finance — Tools
  'simple-interest': dynamic(() => import('@/components/tools/widgets/finance/SimpleInterestCalc'),{ loading, ssr: false }),
  'discount':        dynamic(() => import('@/components/tools/widgets/finance/DiscountCalc'),      { loading, ssr: false }),
  // Finance — Insurance (new group)
  'term-insurance':  dynamic(() => import('@/components/tools/widgets/finance/TermInsuranceCalc'), { loading, ssr: false }),
  'health-insurance':dynamic(() => import('@/components/tools/widgets/finance/HealthInsuranceCalc'),{ loading, ssr: false }),
  'car-insurance':   dynamic(() => import('@/components/tools/widgets/finance/CarInsuranceCalc'),  { loading, ssr: false }),
  // Health — Body & Weight
  'waist-hip-ratio':       dynamic(() => import('@/components/tools/widgets/health/WaistHipRatioCalc'),       { loading, ssr: false }),
  'pregnancy-weight-gain': dynamic(() => import('@/components/tools/widgets/health/PregnancyWeightGainCalc'), { loading, ssr: false }),
  // Health — Nutrition
  'protein-intake':  dynamic(() => import('@/components/tools/widgets/health/ProteinIntakeCalc'),  { loading, ssr: false }),
  'fiber-intake':    dynamic(() => import('@/components/tools/widgets/health/FiberIntakeCalc'),    { loading, ssr: false }),
  // Health — Fitness
  'vo2max':              dynamic(() => import('@/components/tools/widgets/health/VO2MaxCalc'),     { loading, ssr: false }),
  'pace':                dynamic(() => import('@/components/tools/widgets/health/PaceCalc'),       { loading, ssr: false }),
  'one-rep-max-plates':  dynamic(() => import('@/components/tools/widgets/health/PlateLoadCalc'),  { loading, ssr: false }),
  // Health — Life
  'ovulation':       dynamic(() => import('@/components/tools/widgets/health/OvulationCalc'),      { loading, ssr: false }),
};

export function CalcRenderer({ slug }: { slug: string }) {
  const Widget = WIDGETS[slug];
  if (!Widget) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="text-5xl mb-3">🚧</div>
        <p className="font-semibold">Calculator coming soon</p>
      </div>
    );
  }
  return <><Widget /></>;
}

// Alias for merged app consistency
export { CalcRenderer as ToolRenderer };
