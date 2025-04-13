import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { main } from './main'
import { Octokit } from '@octokit/rest'

// Mock Octokit
vi.mock('@octokit/rest', () => {
  return {
    Octokit: vi.fn(() => ({
      users: {
        getAuthenticated: vi.fn(),
        listFollowingForUser: vi.fn(),
        listFollowersForUser: vi.fn()
      }
    }))
  }
})

describe('GitHub Watcher', () => {
  // Save original process.env and console methods
  const originalEnv = process.env
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  const originalProcessExit = process.exit
  
  // Setup mocks
  let mockExit: ReturnType<typeof vi.fn>
  let consoleLogMock: ReturnType<typeof vi.fn>
  let consoleErrorMock: ReturnType<typeof vi.fn>
  let mockOctokit: { users: { getAuthenticated: any, listFollowingForUser: any, listFollowersForUser: any } }
  
  beforeEach(() => {
    // Reset env for each test
    process.env = { ...originalEnv }
    
    // Mock console methods
    consoleLogMock = vi.fn()
    consoleErrorMock = vi.fn()
    console.log = consoleLogMock
    console.error = consoleErrorMock
    
    // Mock process.exit
    mockExit = vi.fn()
    process.exit = mockExit as any
    
    // Setup GitHub token for tests
    process.env.PERSONAL_ACCESS_TOKEN = 'test-token'
    
    // Setup Octokit mock
    mockOctokit = {
      users: {
        getAuthenticated: vi.fn(),
        listFollowingForUser: vi.fn(),
        listFollowersForUser: vi.fn()
      }
    }
    
    // Override Octokit constructor
    vi.mocked(Octokit).mockImplementation(() => mockOctokit as any)
    
    // Reset all mocks
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    // Restore original values
    process.env = originalEnv
    console.log = originalConsoleLog
    console.error = originalConsoleError
    process.exit = originalProcessExit
  })
  
  describe('main function', () => {
    it('should throw an error for unknown command', async () => {
      await main(['unknown-command'])
      
      expect(consoleErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Unknown command')
      )
      expect(mockExit).toHaveBeenCalledWith(1)
    })
    
    it('should throw an error if PERSONAL_ACCESS_TOKEN is not set', async () => {
      delete process.env.PERSONAL_ACCESS_TOKEN
      
      await main(['followers'])
      
      expect(consoleErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('PERSONAL_ACCESS_TOKEN env var not set')
      )
      expect(mockExit).toHaveBeenCalledWith(1)
    })
  })
  
  describe('followers command', () => {
    it('should fetch and sort followers', async () => {
      // Setup mock responses
      mockOctokit.users.getAuthenticated.mockResolvedValue({
        data: { login: 'testuser' }
      })
      
      // First page of followers (full page of 50)
      mockOctokit.users.listFollowersForUser
        .mockResolvedValueOnce({
          data: Array(50).fill(0).map((_, i) => ({ login: `user${i + 100}` }))
        })
        // Second page (partial page, indicating the end)
        .mockResolvedValueOnce({
          data: Array(25).fill(0).map((_, i) => ({ login: `user${i}` }))
        })
      
      await main(['followers'])
      
      // Verify that getAuthenticated was called once
      expect(mockOctokit.users.getAuthenticated).toHaveBeenCalledTimes(1)
      
      // Verify that listFollowersForUser was called with correct params
      expect(mockOctokit.users.listFollowersForUser).toHaveBeenCalledWith({
        username: 'testuser',
        per_page: 50,
        page: 1
      })
      
      // Verify it fetched the second page
      expect(mockOctokit.users.listFollowersForUser).toHaveBeenCalledWith({
        username: 'testuser',
        per_page: 50,
        page: 2
      })
      
      // Verify all users were logged in sorted order
      const expectedUsersSorted = [
        ...Array(25).fill(0).map((_, i) => `user${i}`),
        ...Array(50).fill(0).map((_, i) => `user${i + 100}`)
      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      
      expectedUsersSorted.forEach((user, i) => {
        expect(consoleLogMock).toHaveBeenNthCalledWith(i + 1, user)
      })
    })
    
    it('should handle errors in the followers command', async () => {
      // Setup mock responses to throw an error
      mockOctokit.users.getAuthenticated.mockRejectedValue(new Error('API error'))
      
      await main(['followers'])
      
      // Verify error was logged
      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('API error'))
    })
  })
  
  describe('following command', () => {
    it('should fetch and sort following list', async () => {
      // Setup mock responses
      mockOctokit.users.getAuthenticated.mockResolvedValue({
        data: { login: 'testuser' }
      })
      
      // First page of following (full page of 50)
      mockOctokit.users.listFollowingForUser
        .mockResolvedValueOnce({
          data: Array(50).fill(0).map((_, i) => ({ login: `user${i + 100}` }))
        })
        // Second page (partial page, indicating the end)
        .mockResolvedValueOnce({
          data: Array(25).fill(0).map((_, i) => ({ login: `user${i}` }))
        })
      
      await main(['following'])
      
      // Verify that getAuthenticated was called once
      expect(mockOctokit.users.getAuthenticated).toHaveBeenCalledTimes(1)
      
      // Verify that listFollowingForUser was called with correct params
      expect(mockOctokit.users.listFollowingForUser).toHaveBeenCalledWith({
        username: 'testuser',
        per_page: 50,
        page: 1
      })
      
      // Verify it fetched the second page
      expect(mockOctokit.users.listFollowingForUser).toHaveBeenCalledWith({
        username: 'testuser',
        per_page: 50,
        page: 2
      })
      
      // Verify all users were logged in sorted order
      const expectedUsersSorted = [
        ...Array(25).fill(0).map((_, i) => `user${i}`),
        ...Array(50).fill(0).map((_, i) => `user${i + 100}`)
      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      
      expectedUsersSorted.forEach((user, i) => {
        expect(consoleLogMock).toHaveBeenNthCalledWith(i + 1, user)
      })
    })
    
    it('should handle errors in the following command', async () => {
      // Setup mock responses to throw an error
      mockOctokit.users.getAuthenticated.mockRejectedValue(new Error('API error'))
      
      await main(['following'])
      
      // Verify error was logged
      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('API error'))
    })
  })
}) 