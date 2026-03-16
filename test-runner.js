// Simple test runner for development
// Run with: node test-runner.js

import { hexToRgb } from './src/utils/colors.js'
import { InvalidHexColorError } from './src/errors/InvalidHexColorError.js'

console.log('🧪 Running utility tests...\n')

// Test hexToRgb
const hexTests = [
  { input: '#f00', expected: [255, 0, 0] },
  { input: 'ff0', expected: [255, 255, 0] },
  { input: '#ffffff', expected: [255, 255, 255] },
  { input: '#ff0000', expected: [255, 0, 0] },
  { input: '#00ff00', expected: [0, 255, 0] },
  { input: '#0000ff', expected: [0, 0, 255] },
  { input: '#ff0000ff', expected: [255, 0, 0] },
  { input: 'ABCDEF', expected: [171, 205, 239] }
]

let hexTestsPassed = 0
let hexTestsTotal = hexTests.length

console.log('📨 Testing hexToRgb:')
hexTests.forEach((test, index) => {
  try {
    const result = hexToRgb(test.input)
    if (JSON.stringify(result) === JSON.stringify(test.expected)) {
      console.log(`  ✅ Test ${index + 1}: ${test.input} → ${JSON.stringify(result)}`)
      hexTestsPassed++
    } else {
      console.log(`  ❌ Test ${index + 1}: ${test.input} → Expected ${JSON.stringify(test.expected)}, got ${JSON.stringify(result)}`)
    }
  } catch (error) {
    console.log(`  ❌ Test ${index + 1}: ${test.input} → Error: ${error.message}`)
  }
})

// Test InvalidHexColorError
const errorTests = [
  { hex: '#xyz', shouldHaveError: false },
  { hex: '#abc123', shouldHaveError: false },
  { hex: '#fff', shouldHaveError: false }
]

let errorTestsPassed = 0
let errorTestsTotal = errorTests.length

console.log('\n🚨 Testing InvalidHexColorError:')
errorTests.forEach((test, index) => {
  try {
    const error = new InvalidHexColorError(test.hex)
    
    if (error.name === 'InvalidHexColorError' && 
        error.message.includes('Invalid hex color format') && 
        error.hex === test.hex) {
      console.log(`  ✅ Error Test ${index + 1}: ${test.hex} → ${error.name}`)
      errorTestsPassed++
    } else {
      console.log(`  ❌ Error Test ${index + 1}: ${test.hex} → Failed properties check`)
    }
  } catch (error) {
    console.log(`  ❌ Error Test ${index + 1}: ${test.hex} → Unexpected error: ${error.message}`)
  }
})

// Test invalid hex values that should throw in hexToRgb
const invalidHexTests = ['#xyz', 'abc', '#12', '#12345', '#1234567', '']
let invalidTestsPassed = 0
let invalidTestsTotal = invalidHexTests.length

console.log('\n💥 Testing error handling in hexToRgb:')
invalidHexTests.forEach((test, index) => {
  try {
    hexToRgb(test)
    console.log(`  ❌ Invalid Test ${index + 1}: ${test} → Should have thrown error`)
  } catch (error) {
    if (error instanceof InvalidHexColorError) {
      console.log(`  ✅ Invalid Test ${index + 1}: ${test} → ${error.name}`)
      invalidTestsPassed++
    } else {
      console.log(`  ❌ Invalid Test ${index + 1}: ${test} → Wrong error type: ${error.constructor.name}`)
    }
  }
})

// Summary
const totalPassed = hexTestsPassed + errorTestsPassed + invalidTestsPassed
const totalTests = hexTestsTotal + errorTestsTotal + invalidTestsTotal

console.log('\n📊 Test Results:')
console.log(`  hexToRgb tests: ${hexTestsPassed}/${hexTestsTotal} passed`)
console.log(`  Error class tests: ${errorTestsPassed}/${errorTestsTotal} passed`)
console.log(`  Error handling tests: ${invalidTestsPassed}/${invalidTestsTotal} passed`)
console.log(`  Overall: ${totalPassed}/${totalTests} tests passed (${((totalPassed/totalTests)*100).toFixed(1)}%)`)

if (totalPassed === totalTests) {
  console.log('\n🎉 All tests passed!')
  process.exit(0)
} else {
  console.log('\n💥 Some tests failed!')
  process.exit(1)
}
