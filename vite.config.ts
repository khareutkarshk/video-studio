import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { join } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'

function serveProjectsPlugin(): Plugin {
  const projectsDir = join(process.cwd(), 'projects')
  return {
    name: 'serve-projects',
    configureServer(server) {
      server.middlewares.use('/projects', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? '/'
        const filePath = join(projectsDir, url.split('?')[0])
        if (!filePath.startsWith(projectsDir) || !existsSync(filePath)) {
          next()
          return
        }
        try {
          const body = readFileSync(filePath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(body)
        } catch {
          next()
        }
      })
    },
  }
}

function exportApiPlugin(): Plugin {
  return {
    name: 'export-api',
    configureServer(server) {
      void import(String('./scripts/export/exportServer.ts')).then((mod: {
        attachExportApi: (middlewares: typeof server.middlewares) => void;
      }) => {
        mod.attachExportApi(server.middlewares);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveProjectsPlugin(), exportApiPlugin()],
})
