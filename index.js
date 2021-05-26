import { Router } from 'itty-router'

const USER_AGENT = 'Cloudflare Worker'
const router = Router()

async function getGistContent(id) {
  const res = await fetch(`https://api.github.com/gists/${id}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': USER_AGENT,
    },
  })
  const j = await res.json()
  return j
}

router.get('/css', async () => {
  const gist = await getGistContent(GIST_ID)
  const files = gist.files
  if (files != undefined) {
    return new Response(JSON.stringify(Object.keys(files)))
  }
  return new Response(`gist files not found`, { status: 404 })
})

router.get('/css/:name', async ({ params }) => {
  const gist = await getGistContent(GIST_ID)
  const files = gist.files
  if (files != undefined) {
    const css = files[`${params.name}.css`]
    if (css != undefined) {
      return new Response(css.content, {
        headers: {
          'Content-Type': 'text/css',
        },
      })
    }
  }
  return new Response(`"${params.name}.css" not found`, { status: 404 })
})

router.all('*', () => new Response(`404 not found`, { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
