import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateEMI } from "@/lib/api";

const EMICalculatorSection = () => {
  const [carPrice, setCarPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(150000);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(60);
  const [emiResult, setEmiResult] = useState({ monthlyEmi: 0, totalInterest: 0, totalAmount: 0 });
  const [isCalculating, setIsCalculating] = useState(false);

  const loanAmount = carPrice - downPayment;

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const result = await calculateEMI(loanAmount, interestRate, tenure);
      setEmiResult(result);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [loanAmount, interestRate, tenure]);

  const principalPercentage = (loanAmount / emiResult.totalAmount) * 100 || 0;
  const interestPercentage = (emiResult.totalInterest / emiResult.totalAmount) * 100 || 0;

  return (
    <Card className="p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="car-price">Car Price (₹)</Label>
            <Input
              id="car-price"
              type="number"
              value={carPrice}
              onChange={(e) => setCarPrice(Number(e.target.value))}
              min={100000}
              step={10000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="down-payment">Down Payment (₹)</Label>
            <Input
              id="down-payment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              min={0}
              max={carPrice}
              step={10000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-rate">Interest Rate (% p.a.)</Label>
            <Input
              id="interest-rate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              min={5}
              max={20}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenure">Loan Tenure (Months)</Label>
            <Input
              id="tenure"
              type="number"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              min={12}
              max={84}
              step={12}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Loan Amount</p>
            <p className="text-2xl font-bold">₹{loanAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Monthly EMI</p>
            <p className="text-4xl font-bold text-primary">
              ₹{emiResult.monthlyEmi.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
              <p className="text-xl font-semibold">
                ₹{emiResult.totalInterest.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Payable</p>
              <p className="text-xl font-semibold">
                ₹{emiResult.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Principal vs Interest Split */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Payment Breakdown</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Principal</span>
                <span className="font-medium">{principalPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${principalPercentage}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Interest</span>
                <span className="font-medium">{interestPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${interestPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-4 border-t">
            * EMI calculations are approximate. Actual offers vary by bank and credit score.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EMICalculatorSection;
