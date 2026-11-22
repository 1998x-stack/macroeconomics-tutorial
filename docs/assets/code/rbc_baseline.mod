// rbc_baseline.mod — deterministic calibration + first-order stochastic solution
var y c k invest l w r a;
varexo e_a;
parameters beta delta alpha rho sigma psi phi;

beta  = 0.99;
delta = 0.025;
alpha = 0.33;
rho   = 0.95;
sigma = 0.01;
phi   = 1;
psi   = 8.042774815172917;

model;
    // Household Euler equation; r is the gross marginal product of capital.
    1/c = beta*(1/c(+1))*(1 + r(+1) - delta);

    // Intratemporal labor-supply condition for log utility in consumption.
    psi*l^phi = w/c;

    // Competitive firm factor prices and production.
    w = (1-alpha)*y/l;
    r = alpha*y/k(-1);
    y = exp(a)*k(-1)^alpha*l^(1-alpha);

    // Capital accumulation and goods-market resource constraint.
    k = (1-delta)*k(-1) + invest;
    y = c + invest;

    // Exogenous technology process.
    a = rho*a(-1) + e_a;
end;

initval;
    y      = 0.9950581438;
    c      = 0.7611836866;
    k      = 9.3549782901;
    invest = 0.2338744573;
    l      = 0.33;
    w      = 2.0202695647;
    r      = 0.0351010101;
    a      = 0;
    e_a    = 0;
end;

steady;
check;

shocks;
    var e_a;
    stderr sigma;
end;

stoch_simul(order=1, irf=40) y c invest l k a;
