import type { Challenge } from '../types/challenge';

export const CHALLENGES: Challenge[] = [
  {
    id: 'reverse-string',
    title: 'Reverse a string',
    difficulty: 'beginner',
    language: 'python',
    prompt: 'Write `reverse_string(s)` that returns the string reversed without using slicing.',
    starterCode: `def reverse_string(s: str) -> str:\n    pass\n`,
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"' },
      { input: '"racecar"', expectedOutput: '"racecar"', isHidden: true },
    ],
    hints: ['Build a new string by iterating backwards.'],
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'beginner',
    language: 'python',
    prompt: 'Write `fizzbuzz(n)` that returns a list of strings 1..n, replacing multiples of 3 with "Fizz", 5 with "Buzz", both with "FizzBuzz".',
    starterCode: `def fizzbuzz(n: int) -> list[str]:\n    pass\n`,
    testCases: [
      { input: '5', expectedOutput: '["1","2","Fizz","4","Buzz"]' },
      { input: '15', expectedOutput: '...ends with "FizzBuzz"', isHidden: true },
    ],
    hints: ['Use the modulo operator %.', 'Check divisibility by 15 first, then 3, then 5.'],
  },
  {
    id: 'binary-search',
    title: 'Binary search',
    difficulty: 'intermediate',
    language: 'python',
    prompt: 'Implement `binary_search(arr, target)` that returns the index of target in a sorted array, or -1 if not found. Must run in O(log n).',
    starterCode: `def binary_search(arr: list[int], target: int) -> int:\n    pass\n`,
    testCases: [
      { input: '[1,3,5,7,9], 5', expectedOutput: '2' },
      { input: '[1,3,5,7,9], 4', expectedOutput: '-1' },
      { input: '[], 1', expectedOutput: '-1', isHidden: true },
    ],
    hints: [
      'Track low and high pointers.',
      'Check the midpoint each iteration and halve your search space.',
    ],
  },
];
