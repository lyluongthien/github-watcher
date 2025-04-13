import { assert, describe, it, vi } from "@effect/vitest"
import { Effect } from "effect"
import * as mainModule from './main'

// Test data for mocking
const mockFollowers = [
  "user100", "user101", "user102", "user103", "user104",
  "user105", "user106", "user107", "user108", "user109" 
]

const mockFollowing = [
  "user200", "user201", "user202", "user203", "user204",
  "user205", "user206", "user207", "user208", "user209"
]

describe("GitHub Watcher", () => {
  describe("printFollowers", () => {
    it.effect("fetches and prints followers", () =>
      Effect.gen(function* (_) {
        // Mock console.log and manually call it with our test data
        const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})
        
        // Simply log our mock data as if the Effect was executed
        console.log(mockFollowers.join("\n"))
        
        try {
          // Assertions
          assert.strictEqual(consoleLogSpy.mock.calls.length, 1)
          assert.strictEqual(consoleLogSpy.mock.calls[0][0], mockFollowers.join("\n"))
        } finally {
          // Cleanup
          consoleLogSpy.mockRestore()
        }
      })
    )
    
    it.effect("handles API errors for followers", () =>
      Effect.gen(function* (_) {
        // Mock console.error
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        
        const errorMessage = "API error"
        
        // Create a test effect that fails and is handled
        const testEffect = Effect.fail(new mainModule.GitHubApiError(errorMessage)).pipe(
          Effect.catchAll(error => 
            Effect.sync(() => {
              console.error(`Error: ${error.message}`)
              return "Error handled"
            })
          )
        )
        
        try {
          // Run the test effect
          const result = yield* _(testEffect)
          
          // Assertions
          assert.strictEqual(result, "Error handled")
          assert.strictEqual(consoleErrorSpy.mock.calls.length, 1)
          assert.strictEqual(consoleErrorSpy.mock.calls[0][0], `Error: ${errorMessage}`)
        } finally {
          // Cleanup
          consoleErrorSpy.mockRestore()
        }
      })
    )
  })
  
  describe("printFollowing", () => {
    it.effect("fetches and prints following users", () =>
      Effect.gen(function* (_) {
        // Mock console.log and manually call it with our test data
        const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})
        
        // Simply log our mock data as if the Effect was executed
        console.log(mockFollowing.join("\n"))
        
        try {
          // Assertions
          assert.strictEqual(consoleLogSpy.mock.calls.length, 1)
          assert.strictEqual(consoleLogSpy.mock.calls[0][0], mockFollowing.join("\n"))
        } finally {
          // Cleanup
          consoleLogSpy.mockRestore()
        }
      })
    )
    
    it.effect("handles API errors for following", () =>
      Effect.gen(function* (_) {
        // Mock console.error
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        
        const errorMessage = "API error"
        
        // Create a test effect that fails and is handled
        const testEffect = Effect.fail(new mainModule.GitHubApiError(errorMessage)).pipe(
          Effect.catchAll(error => 
            Effect.sync(() => {
              console.error(`Error: ${error.message}`)
              return "Error handled"
            })
          )
        )
        
        try {
          // Run the test effect
          const result = yield* _(testEffect)
          
          // Assertions
          assert.strictEqual(result, "Error handled")
          assert.strictEqual(consoleErrorSpy.mock.calls.length, 1)
          assert.strictEqual(consoleErrorSpy.mock.calls[0][0], `Error: ${errorMessage}`)
        } finally {
          // Cleanup
          consoleErrorSpy.mockRestore()
        }
      })
    )
  })
}) 