export function calculateFees(amountOfCredits: number) {
  let total = (amountOfCredits / 100) * 1.029 + 0.3;
  if (amountOfCredits <= 100) {
    total = total * 1.6; // < $1
  } else if (100 < amountOfCredits && amountOfCredits <= 1000) {
    total = total * 1.5; // $1 < x < $10
  } else if (1000 < amountOfCredits && amountOfCredits <= 10000) {
    total = total * 1.4; // $10 < x < $100
  } else if (10000 < amountOfCredits && amountOfCredits <= 100000) {
    total = total * 1.3; // $100 < x < $1000
  } else {
    total = total * 1.2; // $1000 < x
  }
  return (total - amountOfCredits / 100).toFixed(2);
}

export function calculateTotal(amountOfCredits: number) {
  let total = (amountOfCredits / 100) * 1.029 + 0.3;
  if (amountOfCredits <= 100) {
    total = total * 1.6; // < $1
  } else if (100 < amountOfCredits && amountOfCredits <= 1000) {
    total = total * 1.5; // $1 < x < $10
  } else if (1000 < amountOfCredits && amountOfCredits <= 10000) {
    total = total * 1.4; // $10 < x < $100
  } else if (10000 < amountOfCredits && amountOfCredits <= 100000) {
    total = total * 1.3; // $100 < x < $1000
  } else {
    total = total * 1.2; // $1000 < x
  }
  return total.toFixed(2);
}
