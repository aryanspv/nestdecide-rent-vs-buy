import { ArrowLeft, Building2, Calculator, MapPin, Users, Shield, ExternalLink } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="space-y-6 pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">NestDecide</h1>
        <p className="text-sm text-muted-foreground">India's honest rent vs buy engine</p>
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">What We Do</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          NestDecide helps you make the biggest financial decision of your life — rent or buy — 
          using real data, honest math, and India-specific intelligence that most calculators ignore.
        </p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Our Edge</h2>
        <div className="space-y-3">
          {[
            { icon: MapPin, title: '10+ Indian Cities', desc: 'Real stamp duty, registration, deposit norms, and rental yield data' },
            { icon: Calculator, title: '30-Year Modelling', desc: 'EMI, property appreciation, tax benefits, and total cost analysis' },
            { icon: Users, title: 'Lifestyle Intelligence', desc: 'Bachelor discrimination, mobility scoring, resale liquidity risk' },
            { icon: Shield, title: 'No Bias', desc: 'We don\'t sell property or loans. No hidden incentives.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="p-2 rounded-xl bg-accent/50 shrink-0 h-fit">
                <item.icon className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Data Sources</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>State government stamp duty & registration schedules</li>
          <li>NHB rental yield reports</li>
          <li>RERA and property market data</li>
          <li>RBI home loan rate benchmarks</li>
        </ul>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Disclaimer</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          NestDecide is a financial modelling tool, not financial advice. All calculations are estimates 
          based on user inputs and publicly available data. Actual costs, returns, and outcomes may vary. 
          Consult a qualified financial advisor before making property decisions.
        </p>
      </div>
    </div>
  );
}
