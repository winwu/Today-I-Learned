/**
 * This practice question is from
 * https://eloquentjavascript.net/02_program_structure.html
 * https://eloquentjavascript.net/
 */

for (let i = 1; i <= 100; i++) {
    let isDivisibleBy3 = i % 3 === 0;
    let isDivisibleBy5 = i % 5 === 0;
    if (isDivisibleBy3 && isDivisibleBy5) {
        console.log('FizzBuzz');
    } else if (isDivisibleBy3) {
        console.log('Fizz');
    } else if (isDivisibleBy5) {
        console.log('Buzz');
    } else {
        console.log(i);
    }
}

// improved after checked the answer from the author's solution

for (let i = 1; i <= 100; i++) {
    let result = '';
    if (i % 3 === 0) {
        result += 'Fizz';
    }
    if (i % 5 === 0) {
        result += 'Buzz';
    }
    console.log(result || i);
}