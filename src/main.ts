import "dotenv/config";
import { Octokit } from "@octokit/rest";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Command, Options } from "@effect/cli";
import { Console, Effect, pipe, Option, Either } from "effect";

// Effect-based GitHub API service
export class GitHubApiError extends Error {
  readonly _tag = "GitHubApiError";
  constructor(message: string) {
    super(message);
    this.name = "GitHubApiError";
  }
}

interface GitHubApi {
  readonly getSelfID: Effect.Effect<string, GitHubApiError>;
  readonly listAllFollowing: (username: string) => Effect.Effect<string[], GitHubApiError>;
  readonly listAllFollowers: (username: string) => Effect.Effect<string[], GitHubApiError>;
}

const makeGitHubApi = (octokit: Octokit): GitHubApi => ({
  getSelfID: Effect.tryPromise({
    try: () => octokit.users.getAuthenticated().then(response => response.data.login),
    catch: (error) => new GitHubApiError(`Failed to get authenticated user: ${String(error)}`)
  }),

  listAllFollowing: (username: string) => fetchAllPages((page) =>
    octokit.users.listFollowingForUser({
      username,
      per_page: 50,
      page,
    })
  ),

  listAllFollowers: (username: string) => fetchAllPages((page) =>
    octokit.users.listFollowersForUser({
      username,
      per_page: 50,
      page,
    })
  )
});

// Helper function to fetch all pages of paginated GitHub API responses
const fetchAllPages = <T extends { data: Array<{ login: string }> }>(
  fetchPage: (page: number) => Promise<T>
): Effect.Effect<string[], GitHubApiError> => {
  const fetchPageEffect = (page: number) => Effect.tryPromise({
    try: () => fetchPage(page),
    catch: (error) => new GitHubApiError(`Failed to fetch page ${page}: ${String(error)}`)
  });

  const go = (page: number, accumulated: string[]): Effect.Effect<string[], GitHubApiError> =>
    pipe(
      fetchPageEffect(page),
      Effect.map(response => {
        const logins = response.data.map(user => user.login);
        const combinedLogins = [...accumulated, ...logins];
        
        // If we got fewer results than the maximum per page, we're done
        if (response.data.length < 50) {
          return Effect.succeed(combinedLogins);
        }
        
        // Otherwise, continue to the next page
        return go(page + 1, combinedLogins);
      }),
      Effect.flatten
    );

  return go(1, []);
};

// Create the GitHub API layer
export const GitHubApiLive = Effect.gen(function* (_) {
  const token = yield* _(Effect.try({
    try: () => {
      const token = process.env.PERSONAL_ACCESS_TOKEN;
      if (!token) throw new Error("PERSONAL_ACCESS_TOKEN env var not set");
      return token;
    },
    catch: () => new GitHubApiError("PERSONAL_ACCESS_TOKEN env var not set")
  }));

  const octokit = new Octokit({ auth: token });
  return makeGitHubApi(octokit);
}).pipe(Effect.map(api => ({ GitHubApi: api })));

// Command handlers
export const printFollowers = Effect.gen(function* (_) {
  const api = yield* _(Effect.map(GitHubApiLive, layer => layer.GitHubApi));
  const login = yield* _(api.getSelfID);
  const followers = yield* _(api.listAllFollowers(login));
  return yield* _(Console.log(`${followers.join("\n")}`));
});

export const printFollowing = Effect.gen(function* (_) {
  const api = yield* _(Effect.map(GitHubApiLive, layer => layer.GitHubApi));
  const login = yield* _(api.getSelfID);
  const following = yield* _(api.listAllFollowing(login));
  return yield* _(Console.log(`${following.join("\n")}`));
});

// Define the commands
const listFollowingCommand = Command.make(
  "list-following",
  {},
  () => printFollowing
);

const listFollowersCommand = Command.make(
  "list-followers", 
  {}, 
  () => printFollowers
);

// Set up the CLI application
const cli = Command.run(
  Command.make("ghtool", {}, () => Console.log("GitHub Tool - Use a subcommand")).pipe(
    Command.withSubcommands([listFollowingCommand, listFollowersCommand])
  ),
  {
    name: "GitHub Tool",
    version: "v1.0.0",
  }
);

if (import.meta.url.endsWith(process.argv[1])) {
  // Prepare and run the CLI application
  cli(process.argv).pipe(
    Effect.provide(NodeContext.layer),
    NodeRuntime.runMain
  );
}
