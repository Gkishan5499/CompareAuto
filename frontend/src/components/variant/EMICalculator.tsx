import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { calculateEMI } from "@/lib/api";

interface EMICalculatorProps {
  defaultAmount: number;
}

const EMICalculator = ({ defaultAmount }: EMICalculatorProps) => {
  const [loanAmount, setLoanAmount] = useState(defaultAmount);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(60);
  const [monthlyEMI, setMonthlyEMI] = useState(0);

  useEffect(() => {
    const fetchEMI = async () => {
      const result = await calculateEMI(loanAmount, interestRate, tenure);
      setMonthlyEMI(result.monthlyEmi);
    };
    fetchEMI();
  }, [loanAmount, interestRate, tenure]);

  const totalPayable = monthlyEMI * tenure;
  const totalInterest = totalPayable - loanAmount;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">EMI Calculator</h3>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Loan Amount</Label>
            <span className="text-sm font-semibold">₹{loanAmount.toLocaleString()}</span>
          </div>
          <Slider
            value={[loanAmount]}
            onValueChange={([value]) => setLoanAmount(value)}
            min={100000}
            max={5000000}
            step={50000}
            className="w-full"
          />
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Interest Rate (% p.a.)</Label>
            <span className="text-sm font-semibold">{interestRate}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={([value]) => setInterestRate(value)}
            min={5}
            max={15}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Tenure */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Loan Tenure (Months)</Label>
            <span className="text-sm font-semibold">{tenure} months</span>
          </div>
          <Slider
            value={[tenure]}
            onValueChange={([value]) => setTenure(value)}
            min={12}
            max={84}
            step={12}
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="border-t pt-6 space-y-4">
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Monthly EMI</p>
            <p className="text-3xl font-bold text-primary">
              ₹{Math.round(monthlyEMI).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
              <p className="text-lg font-semibold">
                ₹{Math.round(totalInterest).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Payable</p>
              <p className="text-lg font-semibold">
                ₹{Math.round(totalPayable).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          * EMI calculations are approximate. Contact your bank for exact rates.
        </p>
      </div>
    </Card>
  );
};

export default EMICalculator;
