import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    RUNTIME: z.enum(['edge', 'nodejs', 'node']).transform(val => val === 'node' ? 'nodejs' : val),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CONTACT_LINK: z.string().url(),
    NEXT_PUBLIC_REPO_LINK: z.string().url(),
    NEXT_PUBLIC_DONATE_LINK: z.string().min(0),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    RUNTIME: process.env.RUNTIME,
    NEXT_PUBLIC_CONTACT_LINK: process.env.NEXT_PUBLIC_CONTACT_LINK,
    NEXT_PUBLIC_REPO_LINK: process.env.NEXT_PUBLIC_REPO_LINK,
    NEXT_PUBLIC_DONATE_LINK: process.env.NEXT_PUBLIC_DONATE_LINK,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
