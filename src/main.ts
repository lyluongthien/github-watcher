import 'dotenv/config'
import { Octokit } from '@octokit/rest'

// Types
type Command = 'followers' | 'following'
type CommandHandler = (octokit: Octokit) => Promise<void>

// Map of available commands
const commands: Record<Command, CommandHandler> = {
  followers: printFollowers,
  following: printFollowing
}

// Get the authenticated user's login
async function getSelfID(octokit: Octokit): Promise<string> {
  const response = await octokit.users.getAuthenticated()
  return response.data.login
}

// Print user's following list
async function printFollowing(octokit: Octokit): Promise<void> {
  try {
    const login = await getSelfID(octokit)
    const following = await listAllFollowing(octokit, login)
    for (const user of following) {
      console.log(user)
    }
  } catch (error) {
    console.error(`Error listing following: ${(error as Error).message}`)
  }
}

// Print user's followers list
async function printFollowers(octokit: Octokit): Promise<void> {
  try {
    const login = await getSelfID(octokit)
    const followers = await listAllFollowers(octokit, login)
    for (const user of followers) {
      console.log(user)
    }
  } catch (error) {
    console.error(`Error listing followers: ${(error as Error).message}`)
  }
}

// List all users the authenticated user is following
async function listAllFollowing(octokit: Octokit, username: string): Promise<string[]> {
  return fetchAllPages((page) => 
    octokit.users.listFollowingForUser({
      username,
      per_page: 50,
      page
    })
  )
}

// List all followers of the authenticated user
async function listAllFollowers(octokit: Octokit, username: string): Promise<string[]> {
  return fetchAllPages((page) => 
    octokit.users.listFollowersForUser({
      username,
      per_page: 50,
      page
    })
  )
}

// Helper function to fetch all pages of paginated GitHub API responses
async function fetchAllPages<T extends { data: Array<{ login: string }> }>(
  fetchPage: (page: number) => Promise<T>
): Promise<string[]> {
  let page = 1
  let accumulated: string[] = []
  
  while (true) {
    const response = await fetchPage(page)
    const logins = response.data.map(user => user.login)
    accumulated = [...accumulated, ...logins]
    
    // Check if we got less than the maximum per_page, meaning we're done
    if (response.data.length < 50) {
      break
    }
    
    // Continue with the next page
    page++
  }
  
  return accumulated
}

// Main program
export async function main(args: string[]): Promise<void> {
  try {
    const cmd = args[0] as Command
    if (!cmd || !commands[cmd]) {
      throw new Error(`Unknown command: ${cmd || ''}. Available commands: ${Object.keys(commands).join(', ')}`)
    }
    
    const token = process.env.PERSONAL_ACCESS_TOKEN
    if (!token) {
      throw new Error('PERSONAL_ACCESS_TOKEN env var not set')
    }
    
    const octokit = new Octokit({
      auth: token
    })
    
    await commands[cmd](octokit)
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`)
    process.exit(1)
  }
}

// CLI entry point
if (import.meta.url.endsWith(process.argv[1]) ) {
  const args = process.argv.slice(2)
  main(args)
} 