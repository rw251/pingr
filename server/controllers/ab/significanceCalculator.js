const lg = Math.log;
const ep = Math.exp;
const ab = Math.abs;

const LogGamma = (Z) => {
  const S = 1 + 76.18009173 / Z - 86.50532033 / (Z + 1) + 24.01409822 / (Z + 2) - 1.231739516 / (Z + 3) + 0.00120858003 / (Z + 4) - 0.00000536382 / (Z + 5);
  const LG = (Z - 0.5) * lg(Z + 4.5) - (Z + 4.5) + lg(S * 2.50662827465);
  return LG;
};

const Gcf = (X, A) => { // Good for X>A+=> 1
  let A0 = 0;
  let B0 = 1;
  let A1 = 1;
  let B1 = X;
  let AOLD = 0;
  let N = 0;
  while (ab((A1 - AOLD) / A1) > 0.00001) {
    AOLD = A1;
    N += 1;
    A0 = A1 + (N - A) * A0;
    B0 = B1 + (N - A) * B0;
    A1 = X * A0 + N * A1;
    B1 = X * B0 + N * B1;
    A0 /= B1;
    B0 /= B1;
    A1 /= B1;
    B1 = 1;
  }
  const Prob = ep(A * lg(X) - X - LogGamma(A)) * A1;

  return 1 - Prob;
};

const Gser = (X, A) => { // Good for X<A+1=> .
  let T9 = 1 / A;
  let G = T9;
  let I = 1;
  while (T9 > G * 0.00001) {
    T9 = T9 * X / (A + I);
    G += T9;
    I += 1;
  }
  G *= ep(A * lg(X) - X - LogGamma(A));

  return G;
};

const normalcdf = (X) => { // HASTINGS.  MAX ERROR = .00000=> 1
  const T = 1 / (1 + 0.2316419 * ab(X));
  const D = 0.3989423 * ep(-X * X / 2);
  let Prob = D * T * (0.3193815 + T * (-0.3565638 + T * (1.781478 + T * (-1.821256 + T * 1.330274))));
  if (X > 0) {
    Prob = 1 - Prob;
  }
  return Prob;
};

const Gammacdf = (x, a) => {
  let GI;
  if (x <= 0) {
    GI = 0;
  } else if (a > 200) {
    z = (x - a) / Math.sqrt(a);
    y = normalcdf(z);
    b1 = 2 / Math.sqrt(a);
    phiz = 0.39894228 * ep(-z * z / 2);
    w = y - b1 * (z * z - 1) * phiz / 6; // Edgeworth1
    b2 = 6 / a;
    u = 3 * b2 * (z * z - 3) + b1 * b1 * (z ^ 4 - 10 * z * z + 15);
    GI = w - phiz * z * u / 72; // Edgeworth2
  } else if (x < a + 1) {
    GI = Gser(x, a);
  } else {
    GI = Gcf(x, a);
  }
  return GI;
};

const compute = (X, A, B) => Math.round(Gammacdf(X * B, A) * 100000) / 100000;

const chi_squared_term = (e, o) => (e - o) * (e - o) / e;

const chi_squared = (s1, t1, s2, t2) => {
  let test_stat = 0.0;
  const mean_p = (s1 + s2) / (t1 + t2);
  test_stat += chi_squared_term(mean_p * t1, s1);
  test_stat += chi_squared_term((1 - mean_p) * t1, t1 - s1);
  test_stat += chi_squared_term(mean_p * t2, s2);
  test_stat += chi_squared_term((1 - mean_p) * t2, t2 - s2);
  return test_stat;
};

exports.pValue = (baseSuccesses, baseTrials, featureSuccesses, featureTrials) => 1.0 - compute(chi_squared(baseSuccesses, baseTrials, featureSuccesses, featureTrials), 0.5, 0.5);
