import concurrently from 'concurrently'

concurrently([
   {
      command: 'bun run build',
      name: 'server',
      cwd: 'apps/server',
      prefixColor: 'cyan',
   },
   {
      command: 'bun run build',
      name: 'pwa',
      cwd: 'apps/pwa',
      prefixColor: 'green',
   },
])
