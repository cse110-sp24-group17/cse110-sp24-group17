/**
 * 
 * Dummy function that returns the sum of two integers
 * 
 * @param {int} a first number
 * @param {int} b second number
 * @returns {int} the sum
 */
export function dummy(a, b) {
    return a + b;
}
/**
 * 
 * Dummy function that substracts b from a, with a redundant variable
 * 
 * @param {int} a first number
 * @param {int} b second number
 * @returns {int} result of subtractions
 */
function dummy2(a, b) {
    redundant = a + b;
    return a - b;
}

/**
 * 
 * Another dummy function, should invoke Codacy warning since == is used instead of ===.
 * 
 * @param {int} input a number input
 * @returns {boolean} returns whether input is 1
 */
function isOne(input) {
    return input == 1;
}