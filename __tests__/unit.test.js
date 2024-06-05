import {
    dummy
  } from '../functions.js';


  
  
  // A dummy test to import a function from functions.js and testing it
  test('1+3=4', () => {
    expect(dummy(1, 3)).toBe(4);
  });
  test('3+1=4', () => {
    expect(dummy(3, 1)).toBe(4);
  });
  test('3+0=3', () => {
    expect(dummy(3, 0)).toBe(3);
  });


