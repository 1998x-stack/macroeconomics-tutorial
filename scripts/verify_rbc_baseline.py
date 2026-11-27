#!/usr/bin/env python3
"""Check the hand-calibrated steady state used by rbc_baseline.mod.
This verifies equation residuals; it does not execute Dynare or estimate the model.
"""
from math import exp

beta, delta, alpha, rho, sigma, psi, phi = (
    0.99, 0.025, 0.33, 0.95, 0.01, 8.042774815172917, 1.0
)
y, c, k, invest, labor, wage, rental, tech = (
    0.9950581438, 0.7611836866, 9.3549782901, 0.2338744573,
    0.33, 2.0202695647, 0.0351010101, 0.0
)
residuals = {
    "production": y - exp(tech) * k**alpha * labor**(1-alpha),
    "resource_constraint": y - c - invest,
    "capital_accumulation": k - (1-delta)*k - invest,
    "wage": wage - (1-alpha)*y/labor,
    "capital_rental": rental - alpha*y/k,
    "labor_supply": psi*labor**phi - wage/c,
    "Euler": 1/c - beta*(1/c)*(1+rental-delta),
    "technology_steady_state": tech - rho*tech,
}
worst = max(abs(v) for v in residuals.values())
for name, value in residuals.items():
    print(f"{name:26s} residual = {value:+.3e}")
if worst > 1e-8:
    raise SystemExit(f"FAIL: maximum residual {worst:.3e} exceeds 1e-8")
print(f"PASS: maximum steady-state residual {worst:.3e} < 1e-8")
print("Note: equation-level calibration check only; run Dynare separately for solver/BK/IRF validation.")
