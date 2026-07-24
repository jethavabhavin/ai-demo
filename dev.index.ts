import concurrently from 'concurrently'

concurrently([
   {
      command: 'bun run dev',
      name: 'server',
      cwd: 'apps/server',
      prefixColor: 'cyan',
   },
   {
      command: 'bun run dev',
      name: 'pwa',
      cwd: 'apps/pwa',
      prefixColor: 'green',
   },
])
